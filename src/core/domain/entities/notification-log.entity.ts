import { Category } from '../enums/category.enum';
import { Channel } from '../enums/channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';

export class NotificationLog {
  readonly id: string;
  readonly messageId: string;
  readonly messageCategory: Category;
  readonly messageBody: string;
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly userPhone: string;
  readonly channel: Channel;
  readonly status: NotificationStatus;
  readonly errorMessage?: string;
  readonly sentAt?: Date;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
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
    createdAt: Date;
  }) {
    Object.assign(this, props);
  }

  get isSuccessful(): boolean {
    return this.status === NotificationStatus.SENT;
  }
}
