import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentBuilder } from '@nestjs/swagger';
import { Account } from 'libs/common/src/models/account.model';
import { AccountService } from './services/account.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountServiceEventHandlers } from './events/handlers';
import { setupSwaggerDocument } from '../../common/src/swagger';
import { AccountServiceQueryHandlers } from './queries/handlers';
import { AppLogger } from '../../common/src/logger/logger.service';
import { AccountServiceCommandHandlers } from './commands/handlers';
import { AccountController } from './controllers/account.controller';
import { GetSystemJWTModule } from 'libs/common/src/middlewares/config';
import { Notification } from '@app/common/src/models/notification.model';
import { OnboardingController } from './controllers/onboarding.controller';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';
import { PeriodSymptomLog } from '@app/common/src/models/period.record.model';
import { PeriodTrackerRecord } from '@app/common/src/models/period.record.model';
import { HelperServiceModule } from '@app/helper-service/src/helper-service.module';
import { OnboardingQuestion } from '@app/common/src/models/onboarding.question.model';
import { PeriodOvulationPrediction } from '@app/common/src/models/period.record.model';
import { SupportService } from '@app/notification-service/src/services/support.service';
import { EmailSenderService } from '@app/helper-service/src/services/email-sender.service';
import { SupportController } from '@app/notification-service/src/controllers/support.controller';
import { ImageUploadController } from '@app/helper-service/src/controllers/image-upload.controller';
import { AccountNotificationService } from '@app/notification-service/src/services/account.notification.service';
import { AccountNotificationController } from '@app/notification-service/src/controllers/account.notification.controller';
import { AuthEmailNotificationService } from '@app/notification-service/src/services/email/auth.email.notification.service';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    HelperServiceModule,
    GetSystemJWTModule(),
    TypeOrmModule.forFeature([
      Account,
      Notification,
      PeriodTracker,
      PeriodSymptomLog,
      OnboardingQuestion,
      PeriodTrackerRecord,
      PeriodOvulationPrediction,
    ]),
  ],
  controllers: [
    AccountController,
    OnboardingController,
    SupportController,
    ImageUploadController,
    AccountNotificationController,
  ],
  providers: [
    AccountService,
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
    SupportService,
    EmailSenderService,
    AuthEmailNotificationService,
    AccountNotificationService,
    ...AccountServiceQueryHandlers,
    ...AccountServiceEventHandlers,
    ...AccountServiceCommandHandlers,
  ],
  exports: [AccountService],
})
export class AccountServiceModule {
  constructor(private configService: ConfigService) {
    setupSwaggerDocument(
      'account-service',
      new DocumentBuilder()
        .addBearerAuth()
        .addServer(this.configService.get<string>('API_HOST'))
        .setTitle('Account Docs')
        .setDescription('Account endpoints...')
        .setVersion('2.0')
        .build(),
    )(AccountServiceModule);
  }
}
