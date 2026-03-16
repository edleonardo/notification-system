import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { kafkaConsumerConfig } from "./infrastructure/config/kafka.config";
import { GlobalExceptionFilter } from "./shared/filters/global-exception.filter";
import { LoggingInterceptor } from "./shared/interceptors/logging.interceptor";
import { ValidationException } from "./shared/exceptions/app.exceptions";

async function bootstrap(): Promise<void> {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    logger: ["log", "warn", "error", "debug"],
  });

  app.connectMicroservice(kafkaConsumerConfig);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((e) =>
          Object.values(e.constraints ?? {}),
        );
        return new ValidationException("Validation failed", messages);
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({ origin: "*", methods: ["GET", "POST", "OPTIONS"] });

  await app.startAllMicroservices();
  logger.log("Kafka consumer started");

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 App running on http://localhost:${port}`);
  logger.log(`📊 Kafka UI  → http://localhost:8080`);
  logger.log(`📬 POST /api/messages`);
  logger.log(`📋 GET  /api/notifications/logs`);
}

bootstrap().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
