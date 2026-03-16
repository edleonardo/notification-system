import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { IMessagePublisher } from '../../../../core/ports/outbound/message-publisher.port';
import { MessagePublishException } from '../../../../shared/exceptions/app.exceptions';

@Injectable()
export class KafkaMessagePublisherAdapter
  implements IMessagePublisher, OnModuleInit
{
  private readonly logger = new Logger(KafkaMessagePublisherAdapter.name);

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.kafkaClient.connect();
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error('Kafka producer connection failed', error);
    }
  }

  async publish<T>(topic: string, message: T): Promise<void> {
    try {
      await this.kafkaClient
        .emit(topic, { value: JSON.stringify(message) })
        .toPromise();
      this.logger.debug(`Published to "${topic}"`);
    } catch (error) {
      this.logger.error(`Failed to publish to "${topic}"`, error);
      throw new MessagePublishException(topic, (error as Error).message);
    }
  }
}
