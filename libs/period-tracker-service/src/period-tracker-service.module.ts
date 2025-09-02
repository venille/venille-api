import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentBuilder } from '@nestjs/swagger';
import { PeriodTrackerServiceCronHandlers } from './jobs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Account } from 'libs/common/src/models/account.model';
import { setupSwaggerDocument } from '../../common/src/swagger';
import { AppLogger } from '../../common/src/logger/logger.service';
import { PeriodTrackerServiceEventHandlers } from './events/handlers';
import { PeriodTrackerServiceQueryHandlers } from './queries/handlers';
import { GetSystemJWTModule } from 'libs/common/src/middlewares/config';
import { Notification } from '@app/common/src/models/notification.model';
import { PeriodTrackerService } from './services/period.tracker.service';
import { PeriodTrackerServiceCommandHandlers } from './commands/handlers';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';
import { PeriodSymptomLog } from '@app/common/src/models/period.record.model';
import { PeriodTrackerRecord } from '@app/common/src/models/period.record.model';
import { PeriodTrackerController } from './controllers/period.tracker.controller';
import { HelperServiceModule } from '@app/helper-service/src/helper-service.module';
import { OnboardingQuestion } from '@app/common/src/models/onboarding.question.model';
import { PeriodOvulationPrediction } from '@app/common/src/models/period.record.model';
import { MenstrualPhase, MenstrualPhaseDescription } from '@app/common/src/models/menstrual.phase.model';

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
      MenstrualPhase,
      PeriodSymptomLog,
      OnboardingQuestion,
      PeriodTrackerRecord,
      MenstrualPhaseDescription,
      PeriodOvulationPrediction,
    ]),
  ],
  controllers: [PeriodTrackerController],
  providers: [
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
    PeriodTrackerService,
    ...PeriodTrackerServiceCronHandlers,
    ...PeriodTrackerServiceEventHandlers,
    ...PeriodTrackerServiceQueryHandlers,
    ...PeriodTrackerServiceCommandHandlers,
  ],
  exports: [],
})
export class PeriodTrackerServiceModule {
  constructor(private configService: ConfigService) {
    setupSwaggerDocument(
      'period-tracker-service',
      new DocumentBuilder()
        .addBearerAuth()
        .addServer(this.configService.get<string>('API_HOST'))
        .setTitle('Period Tracker Docs')
        .setDescription('Period Tracker endpoints...')
        .setVersion('2.0')
        .build(),
    )(PeriodTrackerServiceModule);
  }
}
