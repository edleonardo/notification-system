import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../../core/domain/enums/category.enum';
import { Channel } from '../../../core/domain/enums/channel.enum';
import { NotificationStatus } from '../../../core/domain/enums/notification-status.enum';

@Entity('notification_logs')
@Index('IDX_notif_logs_created_at', ['createdAt'])
@Index('IDX_notif_logs_status', ['status'])
@Index('IDX_notif_logs_channel', ['channel'])
@Index('IDX_notif_logs_user_id', ['userId'])
@Index('IDX_notif_logs_message_id', ['messageId'])
export class NotificationLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id', type: 'varchar', length: 255 })
  messageId: string;

  @Column({ name: 'message_category', type: 'varchar', length: 50 })
  messageCategory: Category;

  @Column({ name: 'message_body', type: 'text' })
  messageBody: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  userId: string;

  @Column({ name: 'user_name', type: 'varchar', length: 255 })
  userName: string;

  @Column({ name: 'user_email', type: 'varchar', length: 255 })
  userEmail: string;

  @Column({ name: 'user_phone', type: 'varchar', length: 50 })
  userPhone: string;

  @Column({ name: 'channel', type: 'varchar', length: 50 })
  channel: Channel;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
