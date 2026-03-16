import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";
import { NotificationLogOrmEntity } from "../database/entities/notification-log.orm-entity";
import { CreateNotificationLogsTable1700000001000 } from "../database/migrations/1700000001000-CreateNotificationLogsTable";

export const databaseConfig: TypeOrmModuleOptions = {
  type: (process.env.DB_TYPE as any) || "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? "5432", 10),
  username: process.env.DB_USER ?? "notification_user",
  password: process.env.DB_PASSWORD ?? "notification_pass",
  database: process.env.DB_NAME ?? "notification_db",
  entities: [NotificationLogOrmEntity],
  migrations: [CreateNotificationLogsTable1700000001000],
  migrationsRun: true,
  synchronize: false,
  logging: process.env.NODE_ENV !== "production",
};

export default new DataSource(databaseConfig as DataSourceOptions);
