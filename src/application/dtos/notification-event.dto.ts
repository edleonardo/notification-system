import { Category } from '../../core/domain/enums/category.enum';

export class NotificationEventDto {
  messageId: string;
  category: Category;
  body: string;
  publishedAt: string;
}
