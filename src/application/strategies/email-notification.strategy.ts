import { Injectable, Logger } from "@nestjs/common";
import { Channel } from "../../core/domain/enums/channel.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../core/ports/outbound/notification-channel.port";
import { INotificationStrategy } from "./interfaces/notification-strategy.interface";

@Injectable()
export class EmailNotificationStrategy implements INotificationStrategy {
  readonly channel = Channel.EMAIL;
  private readonly logger = new Logger(EmailNotificationStrategy.name);

  async execute(payload: NotificationPayload): Promise<NotificationResult> {
    this.logger.log(
      `[Email] → ${payload.userEmail} | user="${payload.userName}" | category=${payload.messageCategory}`,
    );

    await this.simulateSend();

    const result: NotificationResult = {
      success: true,
      channel: this.channel,
      timestamp: new Date(),
      metadata: {
        provider: "SendGrid",
        recipient: payload.userEmail,
        subject: `Notification: ${payload.messageCategory}`,
        templateId: "notification-template-v1",
      },
    };

    this.logger.log(`[Email] ✓ Delivered to ${payload.userEmail}`);
    return result;
  }

  private async simulateSend(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
