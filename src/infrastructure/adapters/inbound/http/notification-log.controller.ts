import { Controller, Get, Inject, Param } from '@nestjs/common';
import {
  INotificationLogRepository,
  NOTIFICATION_LOG_REPOSITORY_PORT,
} from '../../../../core/ports/outbound/notification-log-repository.port';
import { NotificationLog } from '../../../../core/domain/entities/notification-log.entity';

@Controller('api/notifications')
export class NotificationLogController {
  constructor(
    @Inject(NOTIFICATION_LOG_REPOSITORY_PORT)
    private readonly logRepository: INotificationLogRepository,
  ) {}

  @Get('logs')
  async findAll(): Promise<{
    success: boolean;
    data: NotificationLog[];
    total: number;
  }> {
    const data = await this.logRepository.findAll();
    return { success: true, data, total: data.length };
  }

  @Get('logs/:id')
  async findById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: NotificationLog | null }> {
    const data = await this.logRepository.findById(id);
    return { success: true, data };
  }

  @Get('logs/message/:messageId')
  async findByMessageId(
    @Param('messageId') messageId: string,
  ): Promise<{ success: boolean; data: NotificationLog[] }> {
    const data = await this.logRepository.findByMessageId(messageId);
    return { success: true, data };
  }
}
