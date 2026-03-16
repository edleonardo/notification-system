# Notification System

Event-driven notification system built with **NestJS**, **Kafka**, and **PostgreSQL** following strict **Hexagonal Architecture** (Ports & Adapters).

---

## Architecture

```
src/
├── core/                         ← Pure domain — no framework imports
│   ├── domain/
│   │   ├── entities/             ← User, Message, NotificationLog
│   │   └── enums/                ← Category, Channel, NotificationStatus
│   └── ports/
│       ├── inbound/              ← INotificationUseCase
│       └── outbound/             ← IMessagePublisher, IUserRepository,
│                                     INotificationLogRepository, INotificationChannel
│
├── application/                  ← Use-cases and strategies (depends only on core)
│   ├── dtos/                     ← CreateMessageDto, NotificationEventDto
│   ├── services/
│   │   ├── notification.service.ts          ← Publishes to Kafka
│   │   └── notification-dispatcher.service.ts ← Fan-out to subscribers
│   └── strategies/               ← Strategy Pattern
│       ├── interfaces/
│       ├── sms-notification.strategy.ts
│       ├── email-notification.strategy.ts
│       ├── push-notification.strategy.ts
│       └── notification-channel.strategy.ts  ← Context (selects strategy)
│
├── infrastructure/               ← All I/O — adapters implementing ports
│   ├── adapters/
│   │   ├── inbound/
│   │   │   ├── http/             ← MessageController, NotificationLogController
│   │   │   └── kafka/            ← NotificationConsumer (+ DLQ handler)
│   │   └── outbound/
│   │       ├── kafka/            ← KafkaMessagePublisherAdapter
│   │       └/repositories/      ← NotificationLogRepositoryAdapter, UserRepositoryAdapter
│   ├── config/                   ← database.config.ts, kafka.config.ts
│   └── database/
│       ├── entities/             ← NotificationLogOrmEntity
│       ├── migrations/           ← Single canonical migration
│       └── seeders/              ← MOCK_USERS (users.seeder.ts)
│
├── modules/
│   └── notification/
│       └── notification.module.ts  ← All DI bindings (Port → Adapter)
│
└── shared/
    ├── exceptions/               ← AppException hierarchy
    ├── filters/                  ← GlobalExceptionFilter
    └── interceptors/             ← LoggingInterceptor
```

---

## Design Patterns

| Pattern                  | Where                                                                       |
| ------------------------ | --------------------------------------------------------------------------- |
| **Strategy**             | `NotificationChannelStrategy` selects SMS / Email / Push at runtime         |
| **Repository**           | `INotificationLogRepository`, `IUserRepository` abstract all data access    |
| **Dependency Inversion** | Every service injects a Symbol-keyed port; adapters are bound in the module |
| **Hexagonal**            | Core domain has zero framework imports; all I/O lives in `infrastructure/`  |

---

## Event Flow

```
POST /api/messages
  → MessageController
  → NotificationService         (creates Message entity, publishes to Kafka)
  → [Kafka: notifications.send]
  → NotificationConsumer        (deserialises event, retries on error)
  → NotificationDispatcherService
      → UserRepository.findBySubscription(category)
      → for each user × channel → NotificationChannelStrategy.getStrategy(channel).execute()
      → NotificationLogRepository.create()   (SENT or FAILED)
  → [on failure after N retries] → Kafka: notifications.send.dlq
```

---

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

| URL                         | Description                 |
| --------------------------- | --------------------------- |
| http://localhost:3000       | Web UI                      |
| http://localhost:8080       | Kafka UI                    |
| POST /api/messages          | Send a notification message |
| GET /api/notifications/logs | Get all logs (newest first) |

---

## Running Tests

```bash
npm test            # run all tests
npm run test:cov    # with coverage report
```

---

## Users & Subscriptions

| User           | Subscriptions           | Channels         |
| -------------- | ----------------------- | ---------------- |
| Alice Johnson  | Sports, Finance         | SMS, Email       |
| Bob Martinez   | Movies, Finance         | Email, Push      |
| Carol Williams | Sports                  | SMS              |
| David Chen     | Sports, Movies, Finance | SMS, Email, Push |
| Eva Rodriguez  | Movies                  | Push             |
| Frank Thompson | Finance                 | Email            |
| Grace Kim      | Sports, Movies          | SMS, Push        |

---

## 📝 Future Enhancements

- [ ] Implement third-party services for sending notifications.

---

👤 **Eduardo Alves**

- Github: [@edleonardo](https://github.com/edleonardo)
- LinkedIn: [Eduardo Alves Leonardo](https://www.linkedin.com/in/eduardo-alves-leonardo/)
