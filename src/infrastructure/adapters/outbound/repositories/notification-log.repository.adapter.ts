import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLogOrmEntity } from '../../../database/entities/notification-log.orm-entity';
import {
  CreateNotificationLogDto,
  INotificationLogRepository,
} from '../../../../core/ports/outbound/notification-log-repository.port';
import { NotificationLog } from '../../../../core/domain/entities/notification-log.entity';

@Injectable()
export class NotificationLogRepositoryAdapter
  implements INotificationLogRepository
{
  private readonly logger = new Logger(NotificationLogRepositoryAdapter.name);

  constructor(
    @InjectRepository(NotificationLogOrmEntity)
    private readonly orm: Repository<NotificationLogOrmEntity>,
  ) {}

  async create(dto: CreateNotificationLogDto): Promise<NotificationLog> {
    const entity = this.orm.create({
      messageId: dto.messageId,
      messageCategory: dto.messageCategory,
      messageBody: dto.messageBody,
      userId: dto.userId,
      userName: dto.userName,
      userEmail: dto.userEmail,
      userPhone: dto.userPhone,
      channel: dto.channel,
      status: dto.status,
      errorMessage: dto.errorMessage ?? null,
      sentAt: dto.sentAt ?? null,
    });

    const saved = await this.orm.save(entity);
    this.logger.debug(`Log created: ${saved.id}`);
    return this.toDomain(saved);
  }

  async findAll(): Promise<NotificationLog[]> {
    const rows = await this.orm.find({ order: { createdAt: 'DESC' } });
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<NotificationLog | null> {
    const row = await this.orm.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByMessageId(messageId: string): Promise<NotificationLog[]> {
    const rows = await this.orm.find({
      where: { messageId },
      order: { createdAt: 'DESC' },
    });
    return rows.map(this.toDomain);
  }

  async findByUserId(userId: string): Promise<NotificationLog[]> {
    const rows = await this.orm.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map(this.toDomain);
  }

  private toDomain(row: NotificationLogOrmEntity): NotificationLog {
    return new NotificationLog({
      id: row.id,
      messageId: row.messageId,
      messageCategory: row.messageCategory,
      messageBody: row.messageBody,
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
      userPhone: row.userPhone,
      channel: row.channel,
      status: row.status,
      errorMessage: row.errorMessage ?? undefined,
      sentAt: row.sentAt ?? undefined,
      createdAt: row.createdAt,
    });
  }
}
