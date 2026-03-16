import { Inject, Injectable, Logger } from "@nestjs/common";
import { Message } from "../../core/domain/entities/message.entity";
import {
  INotificationUseCase,
  SendMessageCommand,
  SendMessageResult,
} from "../../core/ports/inbound/notification-use-case.port";
import {
  IMessagePublisher,
  MESSAGE_PUBLISHER_PORT,
} from "../../core/ports/outbound/message-publisher.port";
import { NotificationEventDto } from "../dtos/notification-event.dto";
import { KAFKA_TOPICS } from "../../infrastructure/config/kafka.config";

@Injectable()
export class NotificationService implements INotificationUseCase {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(MESSAGE_PUBLISHER_PORT)
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  async sendMessage(command: SendMessageCommand): Promise<SendMessageResult> {
    const message = new Message({
      category: command.category,
      body: command.body,
    });

    this.logger.log(
      `Publishing message [${message.id}] | Category: ${message.category}`,
    );

    const event: NotificationEventDto = {
      messageId: message.id,
      category: message.category,
      body: message.body,
      publishedAt: message.createdAt.toISOString(),
    };

    await this.messagePublisher.publish(KAFKA_TOPICS.NOTIFICATIONS_SEND, event);

    this.logger.log(
      `Message [${message.id}] published to "${KAFKA_TOPICS.NOTIFICATIONS_SEND}"`,
    );

    return {
      messageId: message.id,
      category: message.category,
      body: message.body,
      publishedAt: message.createdAt,
    };
  }
}
