import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotificationModule } from './modules/notification/notification.module';
import { databaseConfig } from './infrastructure/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig as any),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    NotificationModule,
  ],
})
export class AppModule {}
