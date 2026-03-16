import { Category } from '../../domain/enums/category.enum';
import { Channel } from '../../domain/enums/channel.enum';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import { NotificationLog } from '../../domain/entities/notification-log.entity';

export const NOTIFICATION_LOG_REPOSITORY_PORT = Symbol('INotificationLogRepository');

export interface CreateNotificationLogDto {
  messageId: string;
  messageCategory: Category;
  messageBody: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  channel: Channel;
  status: NotificationStatus;
  errorMessage?: string;
  sentAt?: Date;
}

export interface INotificationLogRepository {
  create(dto: CreateNotificationLogDto): Promise<NotificationLog>;
  findAll(): Promise<NotificationLog[]>;
  findById(id: string): Promise<NotificationLog | null>;
  findByMessageId(messageId: string): Promise<NotificationLog[]>;
  findByUserId(userId: string): Promise<NotificationLog[]>;
}
