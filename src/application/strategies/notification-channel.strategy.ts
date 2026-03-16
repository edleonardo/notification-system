import { Injectable } from "@nestjs/common";
import { Channel } from "../../core/domain/enums/channel.enum";
import { INotificationStrategy } from "./interfaces/notification-strategy.interface";
import { SmsNotificationStrategy } from "./sms-notification.strategy";
import { EmailNotificationStrategy } from "./email-notification.strategy";
import { PushNotificationStrategy } from "./push-notification.strategy";
import { InvalidChannelException } from "../../shared/exceptions/app.exceptions";

@Injectable()
export class NotificationChannelStrategy {
  private readonly strategies: Map<Channel, INotificationStrategy>;

  constructor(
    private readonly smsStrategy: SmsNotificationStrategy,
    private readonly emailStrategy: EmailNotificationStrategy,
    private readonly pushStrategy: PushNotificationStrategy,
  ) {
    this.strategies = new Map<Channel, INotificationStrategy>([
      [Channel.SMS, this.smsStrategy],
      [Channel.EMAIL, this.emailStrategy],
      [Channel.PUSH_NOTIFICATION, this.pushStrategy],
    ]);
  }

  getStrategy(channel: Channel): INotificationStrategy {
    const strategy = this.strategies.get(channel);
    if (!strategy) {
      throw new InvalidChannelException(channel);
    }
    return strategy;
  }

  getSupportedChannels(): Channel[] {
    return Array.from(this.strategies.keys());
  }
}
