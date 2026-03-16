import { Channel } from '../../../core/domain/enums/channel.enum';
import {
  NotificationPayload,
  NotificationResult,
} from '../../../core/ports/outbound/notification-channel.port';

export interface INotificationStrategy {
  readonly channel: Channel;
  execute(payload: NotificationPayload): Promise<NotificationResult>;
}
