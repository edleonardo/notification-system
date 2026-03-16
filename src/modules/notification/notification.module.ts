import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsModule } from "@nestjs/microservices";

import { NotificationLogOrmEntity } from "../../infrastructure/database/entities/notification-log.orm-entity";

import { MessageController } from "../../infrastructure/adapters/inbound/http/message.controller";
import { NotificationLogController } from "../../infrastructure/adapters/inbound/http/notification-log.controller";
import { NotificationConsumer } from "../../infrastructure/adapters/inbound/kafka/notification.consumer";

import { NotificationLogRepositoryAdapter } from "../../infrastructure/adapters/outbound/repositories/notification-log.repository.adapter";
import { UserRepositoryAdapter } from "../../infrastructure/adapters/outbound/repositories/user.repository.adapter";
import { KafkaMessagePublisherAdapter } from "../../infrastructure/adapters/outbound/kafka/kafka-message-publisher.adapter";

import { NotificationService } from "../../application/services/notification.service";
import { NotificationDispatcherService } from "../../application/services/notification-dispatcher.service";

import { NotificationChannelStrategy } from "../../application/strategies/notification-channel.strategy";
import { SmsNotificationStrategy } from "../../application/strategies/sms-notification.strategy";
import { EmailNotificationStrategy } from "../../application/strategies/email-notification.strategy";
import { PushNotificationStrategy } from "../../application/strategies/push-notification.strategy";

import { NOTIFICATION_USE_CASE_PORT } from "../../core/ports/inbound/notification-use-case.port";
import { MESSAGE_PUBLISHER_PORT } from "../../core/ports/outbound/message-publisher.port";
import { NOTIFICATION_LOG_REPOSITORY_PORT } from "../../core/ports/outbound/notification-log-repository.port";
import { USER_REPOSITORY_PORT } from "../../core/ports/outbound/user-repository.port";

import { kafkaClientConfig } from "../../infrastructure/config/kafka.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationLogOrmEntity]),
    ClientsModule.register([kafkaClientConfig as any]),
  ],
  controllers: [
    MessageController,
    NotificationLogController,
    NotificationConsumer,
  ],
  providers: [
    NotificationService,
    NotificationDispatcherService,
    SmsNotificationStrategy,
    EmailNotificationStrategy,
    PushNotificationStrategy,
    NotificationChannelStrategy,
    { provide: NOTIFICATION_USE_CASE_PORT, useClass: NotificationService },
    {
      provide: NOTIFICATION_LOG_REPOSITORY_PORT,
      useClass: NotificationLogRepositoryAdapter,
    },
    { provide: USER_REPOSITORY_PORT, useClass: UserRepositoryAdapter },
    { provide: MESSAGE_PUBLISHER_PORT, useClass: KafkaMessagePublisherAdapter },
  ],
})
export class NotificationModule {}
