import { Injectable, Logger } from "@nestjs/common";
import { Channel } from "../../core/domain/enums/channel.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../core/ports/outbound/notification-channel.port";
import { INotificationStrategy } from "./interfaces/notification-strategy.interface";

@Injectable()
export class PushNotificationStrategy implements INotificationStrategy {
  readonly channel = Channel.PUSH_NOTIFICATION;
  private readonly logger = new Logger(PushNotificationStrategy.name);

  async execute(payload: NotificationPayload): Promise<NotificationResult> {
    this.logger.log(
      `[Push] → userId=${payload.userId} | user="${payload.userName}" | category=${payload.messageCategory}`,
    );

    await this.simulateSend();

    const result: NotificationResult = {
      success: true,
      channel: this.channel,
      timestamp: new Date(),
      metadata: {
        provider: "Firebase FCM",
        userId: payload.userId,
        title: `New ${payload.messageCategory} Alert`,
        body: payload.messageBody.substring(0, 100),
      },
    };

    this.logger.log(`[Push] ✓ Delivered to userId=${payload.userId}`);
    return result;
  }

  private async simulateSend(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
