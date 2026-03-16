import { Channel } from '../../domain/enums/channel.enum';

export const NOTIFICATION_CHANNEL_PORT = Symbol('INotificationChannel');

export interface NotificationPayload {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  messageId: string;
  messageCategory: string;
  messageBody: string;
  channel: Channel;
}

export interface NotificationResult {
  success: boolean;
  channel: Channel;
  timestamp: Date;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface INotificationChannel {
  readonly channel: Channel;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
