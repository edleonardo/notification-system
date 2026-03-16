import { KafkaOptions, Transport } from "@nestjs/microservices";

export const KAFKA_TOPICS = {
  NOTIFICATIONS_SEND: process.env.KAFKA_TOPIC ?? "notifications.send",
  NOTIFICATIONS_DLQ: process.env.KAFKA_DLQ_TOPIC ?? "notifications.send.dlq",
};

const brokers = (process.env.KAFKA_BROKERS ?? "localhost:29092").split(",");
const retries = parseInt(process.env.KAFKA_RETRY_ATTEMPTS ?? "3", 10);

export const kafkaConsumerConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: "notification-consumer",
      brokers,
      retry: { initialRetryTime: 300, retries },
    },
    consumer: {
      groupId: process.env.KAFKA_GROUP_ID ?? "notification-consumer-group",
      allowAutoTopicCreation: true,
    },
  },
};

export const kafkaClientConfig = {
  name: "KAFKA_SERVICE",
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: "notification-producer",
      brokers,
      retry: { initialRetryTime: 300, retries },
    },
    producer: { allowAutoTopicCreation: true },
  },
};
