import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { HealthModule } from './health/health.module';
import { AuthServiceModule } from 'libs/auth-service/src';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CommonModule } from 'libs/common/src/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'libs/common/src/auth/jwt.strategy';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { DatabaseSource } from 'libs/common/src/database/database-source';
import { DeviceInfoMiddleware } from 'libs/common/src/middlewares/device.info.middleware';
import { SuccessResponseMiddleware } from 'libs/common/src/middlewares/success.middleware';
import { NotificationServiceModule } from '@app/notification-service/src/notification-service.module';

@Module({
  imports: [
    HealthModule,
    CommonModule,
    AuthServiceModule,
    NotificationServiceModule,
    TypeOrmModule.forRoot(DatabaseSource),
    CacheModule.register({ isGlobal: true }),
    LoggerModule.forRoot(),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    RouterModule.register([
      // {
      //   path: 'v1/account',
      //   module: AccountServiceModule,
      // },
      {
        path: 'v1/auth',
        module: AuthServiceModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeviceInfoMiddleware).forRoutes('*');
    consumer.apply(SuccessResponseMiddleware).forRoutes('*');
  }
}
