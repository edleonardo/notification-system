import { Category } from '../../domain/enums/category.enum';

export const NOTIFICATION_USE_CASE_PORT = Symbol('INotificationUseCase');

export interface SendMessageCommand {
  category: Category;
  body: string;
}

export interface SendMessageResult {
  messageId: string;
  category: Category;
  body: string;
  publishedAt: Date;
}

export interface INotificationUseCase {
  sendMessage(command: SendMessageCommand): Promise<SendMessageResult>;
}
