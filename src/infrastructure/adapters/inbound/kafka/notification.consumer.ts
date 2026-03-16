import { Controller, Inject, Logger } from "@nestjs/common";
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from "@nestjs/microservices";
import { NotificationDispatcherService } from "../../../../application/services/notification-dispatcher.service";
import { NotificationEventDto } from "../../../../application/dtos/notification-event.dto";
import {
  IMessagePublisher,
  MESSAGE_PUBLISHER_PORT,
} from "../../../../core/ports/outbound/message-publisher.port";
import { KAFKA_TOPICS } from "../../../config/kafka.config";

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);
  private readonly maxRetries = parseInt(
    process.env.KAFKA_RETRY_ATTEMPTS ?? "3",
    10,
  );

  constructor(
    private readonly dispatcherService: NotificationDispatcherService,
    @Inject(MESSAGE_PUBLISHER_PORT)
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  @EventPattern(KAFKA_TOPICS.NOTIFICATIONS_SEND)
  async handleNotificationEvent(
    @Payload() data: NotificationEventDto,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const { offset } = context.getMessage();
    const partition = context.getPartition();

    this.logger.log(
      `Received event | partition=${partition} offset=${offset} | messageId=${data?.messageId}`,
    );

    const retryCount = this.getRetryCount(context);

    try {
      const event = this.parseEvent(data);
      await this.dispatcherService.dispatch(event);
    } catch (error) {
      const msg = (error as Error).message;
      this.logger.error(
        `Processing failed for [${data?.messageId}] attempt=${retryCount + 1}: ${msg}`,
      );

      if (retryCount >= this.maxRetries - 1) {
        await this.sendToDlq(data, msg, retryCount);
      } else {
        throw error;
      }
    }
  }

  @EventPattern(KAFKA_TOPICS.NOTIFICATIONS_DLQ)
  async handleDlqEvent(
    @Payload() data: unknown,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    this.logger.error(
      `DLQ message | partition=${context.getPartition()} offset=${context.getMessage().offset}`,
    );
    await this.dispatcherService.handleDlqMessage(data);
  }

  private parseEvent(data: NotificationEventDto): NotificationEventDto {
    return typeof data === "string"
      ? (JSON.parse(data) as NotificationEventDto)
      : data;
  }

  private getRetryCount(context: KafkaContext): number {
    const headers = context.getMessage().headers ?? {};
    const header = headers["x-retry-count"];
    if (!header) return 0;
    const value = Buffer.isBuffer(header) ? header.toString() : String(header);
    return parseInt(value, 10) || 0;
  }

  private async sendToDlq(
    original: NotificationEventDto,
    errorMessage: string,
    retryCount: number,
  ): Promise<void> {
    this.logger.warn(
      `Forwarding [${original?.messageId}] to DLQ after ${retryCount + 1} attempts`,
    );

    try {
      await this.messagePublisher.publish(KAFKA_TOPICS.NOTIFICATIONS_DLQ, {
        originalMessage: original,
        errorMessage,
        retryCount,
        failedAt: new Date().toISOString(),
      });
    } catch (dlqError) {
      this.logger.error(
        `CRITICAL: Could not write to DLQ: ${(dlqError as Error).message}`,
      );
    }
  }
}
