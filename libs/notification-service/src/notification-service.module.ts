import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationServiceCronHandlers } from './jobs';
import { SupportService } from './services/support.service';
import { Account } from 'libs/common/src/models/account.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { SupportController } from './controllers/support.controller';
import { Notification } from 'libs/common/src/models/notification.model';
import { HelperServiceModule } from '@app/helper-service/src/helper-service.module';
import { AccountNotificationService } from './services/account.notification.service';
import { EmailSenderService } from 'libs/helper-service/src/services/email-sender.service';
import { AccountNotificationController } from './controllers/account.notification.controller';
import { AuthEmailNotificationService } from './services/email/auth.email.notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Notification,
    ]),
    CqrsModule,
    ConfigModule,
    HelperServiceModule,
  ],
  providers: [
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
    SupportService,
    EmailSenderService,
    AuthEmailNotificationService,
    AccountNotificationService,
    ...NotificationServiceCronHandlers,
  ],
  exports: [
    SupportService,
    AuthEmailNotificationService,
    // AccountNotificationController,
  ],
  controllers: [SupportController, AccountNotificationController],
})
export class NotificationServiceModule {}
