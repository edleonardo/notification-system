import { Inject, Injectable, Logger } from "@nestjs/common";
import { NotificationEventDto } from "../dtos/notification-event.dto";
import { NotificationChannelStrategy } from "../strategies/notification-channel.strategy";
import {
  IUserRepository,
  USER_REPOSITORY_PORT,
} from "../../core/ports/outbound/user-repository.port";
import {
  INotificationLogRepository,
  NOTIFICATION_LOG_REPOSITORY_PORT,
} from "../../core/ports/outbound/notification-log-repository.port";
import {
  IMessagePublisher,
  MESSAGE_PUBLISHER_PORT,
} from "../../core/ports/outbound/message-publisher.port";
import { NotificationPayload } from "../../core/ports/outbound/notification-channel.port";
import { NotificationStatus } from "../../core/domain/enums/notification-status.enum";
import { Channel } from "../../core/domain/enums/channel.enum";
import { KAFKA_TOPICS } from "../../infrastructure/config/kafka.config";

export interface DispatchResult {
  messageId: string;
  totalNotifications: number;
  successful: number;
  failed: number;
}

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: IUserRepository,
    @Inject(NOTIFICATION_LOG_REPOSITORY_PORT)
    private readonly notificationLogRepository: INotificationLogRepository,
    @Inject(MESSAGE_PUBLISHER_PORT)
    private readonly messagePublisher: IMessagePublisher,
    private readonly channelStrategy: NotificationChannelStrategy,
  ) {}

  async dispatch(event: NotificationEventDto): Promise<DispatchResult> {
    this.logger.log(
      `Dispatching [${event.messageId}] | Category: ${event.category}`,
    );

    const subscribedUsers = await this.userRepository.findBySubscription(
      event.category,
    );

    if (subscribedUsers.length === 0) {
      this.logger.warn(`No subscribers found for category "${event.category}"`);
      return {
        messageId: event.messageId,
        totalNotifications: 0,
        successful: 0,
        failed: 0,
      };
    }

    this.logger.log(
      `Found ${subscribedUsers.length} subscriber(s) for "${event.category}"`,
    );

    let successful = 0;
    let failed = 0;

    for (const user of subscribedUsers) {
      const results = await Promise.allSettled(
        user
          .getNotificationChannels()
          .map((channel) => this.sendToChannel(event, user, channel)),
      );

      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value) successful++;
        else failed++;
      });
    }

    const totalNotifications = subscribedUsers.reduce(
      (acc, u) => acc + u.getNotificationChannels().length,
      0,
    );

    this.logger.log(
      `Done [${event.messageId}] | total=${totalNotifications} sent=${successful} failed=${failed}`,
    );

    return {
      messageId: event.messageId,
      totalNotifications,
      successful,
      failed,
    };
  }

  private async sendToChannel(
    event: NotificationEventDto,
    user: { id: string; name: string; email: string; phone: string },
    channel: Channel,
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      messageId: event.messageId,
      messageCategory: event.category,
      messageBody: event.body,
      channel,
    };

    try {
      const strategy = this.channelStrategy.getStrategy(channel);
      const result = await strategy.execute(payload);

      await this.notificationLogRepository.create({
        messageId: event.messageId,
        messageCategory: event.category,
        messageBody: event.body,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        channel,
        status: result.success
          ? NotificationStatus.SENT
          : NotificationStatus.FAILED,
        sentAt: result.success ? result.timestamp : undefined,
        errorMessage: result.errorMessage,
      });

      return result.success;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.error(
        `Channel ${channel} failed for user ${user.id}: ${errorMessage}`,
      );

      await this.notificationLogRepository.create({
        messageId: event.messageId,
        messageCategory: event.category,
        messageBody: event.body,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        channel,
        status: NotificationStatus.FAILED,
        errorMessage,
      });

      return false;
    }
  }

  async handleDlqMessage(rawMessage: unknown): Promise<void> {
    this.logger.error(
      `[DLQ] Received failed message: ${JSON.stringify(rawMessage)}`,
    );
  }
}
