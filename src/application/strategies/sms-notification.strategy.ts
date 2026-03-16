import { Injectable, Logger } from "@nestjs/common";
import { Channel } from "../../core/domain/enums/channel.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../core/ports/outbound/notification-channel.port";
import { INotificationStrategy } from "./interfaces/notification-strategy.interface";

@Injectable()
export class SmsNotificationStrategy implements INotificationStrategy {
  readonly channel = Channel.SMS;
  private readonly logger = new Logger(SmsNotificationStrategy.name);

  async execute(payload: NotificationPayload): Promise<NotificationResult> {
    this.logger.log(
      `[SMS] → ${payload.userPhone} | user="${payload.userName}" | category=${payload.messageCategory}`,
    );

    await this.simulateSend();

    const result: NotificationResult = {
      success: true,
      channel: this.channel,
      timestamp: new Date(),
      metadata: {
        provider: "Twilio",
        recipient: payload.userPhone,
        messageLength: payload.messageBody.length,
      },
    };

    this.logger.log(`[SMS] ✓ Delivered to ${payload.userPhone}`);
    return result;
  }

  private async simulateSend(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
