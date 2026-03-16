import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CreateMessageDto } from '../../../../application/dtos/create-message.dto';
import {
  INotificationUseCase,
  NOTIFICATION_USE_CASE_PORT,
  SendMessageResult,
} from '../../../../core/ports/inbound/notification-use-case.port';

@Controller('api/messages')
export class MessageController {
  constructor(
    @Inject(NOTIFICATION_USE_CASE_PORT)
    private readonly notificationUseCase: INotificationUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async sendMessage(
    @Body() dto: CreateMessageDto,
  ): Promise<{ success: boolean; data: SendMessageResult; message: string }> {
    const result = await this.notificationUseCase.sendMessage({
      category: dto.category,
      body: dto.body,
    });

    return {
      success: true,
      data: result,
      message: 'Message accepted and queued for delivery',
    };
  }
}
