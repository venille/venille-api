import {
  LutealPhaseNotificationTemplates,
  MenstrualPhaseNotificationTemplates,
  OvulationPhaseNotificationTemplates,
  FollicularPhaseNotificationTemplates,
  LutealPhaseDietNotificationTemplates,
  OvulationPhaseDietNotificationTemplates,
  MenstrualPhaseDietNotificationTemplates,
  FollicularPhaseDietNotificationTemplates,
} from './template';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { QueryBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Account } from '@app/common/src/models/account.model';
import { MenstrualPhase } from '@app/common/src/constants/enums';
import { AppLogger } from '@app/common/src/logger/logger.service';
import FCMessaging from '@app/notification-service/src/bases/FCMessaging';
import { FetchUserPredictedPeriodTrackerHistoryQuery } from '../queries/impl';
import { MonthlyPeriodInfo } from '@app/common/src/models/period.record.model';
import { getRotationTemplate, getTemplateByDay } from '@app/common/src/helpers/push.notification.helper';
import { HormonalBalanceAdviceTemplates, InfectionPreventionRemedyTemplates, VenillePadsMarketingTemplates } from './template/default.notification.templates';

@Injectable()
export class PeriodTrackerCronService {
  constructor(
    private readonly queryBus: QueryBus,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @Inject('Logger') private readonly logger: AppLogger,
  ) { }

  // !MORNING -> MENSTRUAL PHASE NOTIFICATION
  // @Cron('*/60 * * * * *', { timeZone: 'Africa/Lagos' })
  @Cron('05 10 * * *', { timeZone: 'Africa/Lagos' })
  async morningMenstrualPhaseCronHandler() {
    try {
      this.logger.log(`[MORNING-MENSTRUAL-PHASE-CRONJOB-PROCESSING]`);

      const users = await this.accountRepository.find();

      await Promise.all(users.map(async (user) => {
        try {
          this.logger.log(`[MORNING-MENSTRUAL-PHASE-MANAGER-PROCESSING]`);
          let title, body = '';
          let template: { title: string, body: string };

          const currentMonthPredictedPeriodLog: MonthlyPeriodInfo | null = await this.queryBus.execute(
            new FetchUserPredictedPeriodTrackerHistoryQuery(user.id),
          );

          if (!currentMonthPredictedPeriodLog) return;

          const todayPeriodInfo = currentMonthPredictedPeriodLog?.days.find((day) => day.isToday) ?? null;

          if (!todayPeriodInfo) {
            console.log(`[FCM-DEBUG] No todayPeriodInfo for user ${user.id}`);
            return;
          }

          if (todayPeriodInfo.currentPhase === MenstrualPhase.MENSTRUAL_PHASE) {
            template = getTemplateByDay(MenstrualPhaseNotificationTemplates);

            title = template.title;
            body = template.body;
          } else if (todayPeriodInfo.currentPhase === MenstrualPhase.FOLLICULAR_PHASE) {
            template = getTemplateByDay(FollicularPhaseNotificationTemplates);

            title = template.title;
            body = template.body;
          } else if (todayPeriodInfo.currentPhase === MenstrualPhase.LUTEAL_PHASE) {
            template = getTemplateByDay(LutealPhaseNotificationTemplates);

            title = template.title;
            body = template.body;
          } else if (todayPeriodInfo.currentPhase === MenstrualPhase.OVULATION_PHASE) {
            template = getTemplateByDay(OvulationPhaseNotificationTemplates);

            title = template.title;
            body = template.body;
          }

          if (user.fcmToken?.length > 2 && title) {
            await FCMessaging.sendNotification(user.fcmToken, {
              title,
              body,
              data: {},
            });
          }

          this.logger.log(`[MORNING-MENSTRUAL-PHASE-MANAGER-SUCCESS]`);
        } catch (error) {
          this.logger.error(`[MORNING-MENSTRUAL-PHASE-MANAGER-ERROR] :: ${error}`);
        }
      }));

      this.logger.log(`[MORNING-MENSTRUAL-PHASE-CRONJOB-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[MORNING-MENSTRUAL-PHASE-CRONJOB-ERROR] :: ${error}`);
    }
  }

  // !MORNING -> MENSTRUAL PHASE DIET NOTIFICATION
  // @Cron('*/60 * * * * *', { timeZone: 'Africa/Lagos' })
  @Cron('05 06 * * *', { timeZone: 'Africa/Lagos' })
  async morningMenstrualPhaseDietCronHandler() {
    try {
      this.logger.log(`[MORNING-MENSTRUAL-PHASE-DIET-CRONJOB-PROCESSING]`);

      const users = await this.accountRepository.find();

      await Promise.all(users.map(async (user) => {
        try {
          this.logger.log(`[MORNING-MENSTRUAL-PHASE-DIET-MANAGER-PROCESSING]`);
          let title, body = '';
          let template: { title: string, body: string };

          const currentMonthPredictedPeriodLog: MonthlyPeriodInfo | null = await this.queryBus.execute(
            new FetchUserPredictedPeriodTrackerHistoryQuery(user.id),
          );

          if (!currentMonthPredictedPeriodLog) return;

          const todayPeriodInfo = currentMonthPredictedPeriodLog?.days.find((day) => day.isToday) ?? null;

          if (!todayPeriodInfo) {
            console.log(`[FCM-DEBUG] No todayPeriodInfo for user ${user.id}`);
            return;
          }

          if (todayPeriodInfo.currentPhase === MenstrualPhase.MENSTRUAL_PHASE) {
            template = getTemplateByDay(MenstrualPhaseDietNotificationTemplates);

            title = template.title;
            body = template.body;
          } else if (todayPeriodInfo.currentPhase === MenstrualPhase.FOLLICULAR_PHASE) {
            template = getTemplateByDay(FollicularPhaseDietNotificationTemplates);

            title = template.title;
            body = template.body;
          } else if (todayPeriodInfo.currentPhase === MenstrualPhase.LUTEAL_PHASE) {
            template = getTemplateByDay(LutealPhaseDietNotificationTemplates);

            title = template.title;
            body = template.body;
          } else if (todayPeriodInfo.currentPhase === MenstrualPhase.OVULATION_PHASE) {
            template = getTemplateByDay(OvulationPhaseDietNotificationTemplates);

            title = template.title;
            body = template.body;
          }

          if (user.fcmToken?.length > 2 && title) {
            await FCMessaging.sendNotification(user.fcmToken, {
              title,
              body,
              data: {},
            });
          }

          this.logger.log(`[MORNING-MENSTRUAL-PHASE-DIET-MANAGER-SUCCESS]`);
        } catch (error) {
          this.logger.error(`[MORNING-MENSTRUAL-PHASE-DIET-MANAGER-ERROR] :: ${error}`);
        }
      }));

      this.logger.log(`[MORNING-MENSTRUAL-PHASE-DIET-CRONJOB-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[MORNING-MENSTRUAL-PHASE-DIET-CRONJOB-ERROR] :: ${error}`);
    }
  }

  // !MORNING -> HORMONAL BALANCE ADVICE NOTIFICATION
  // @Cron('*/60 * * * * *', { timeZone: 'Africa/Lagos' })
  @Cron('05 11 * * *', { timeZone: 'Africa/Lagos' })
  async morningHormonalBalanceAdviceCronHandler() {
    try {
      this.logger.log(`[MORNING-HORMONAL-BALANCE-ADVICE-CRONJOB-PROCESSING]`);

      const users = await this.accountRepository.find();

      await Promise.all(users.map(async (user) => {
        try {
          this.logger.log(`[MORNING-HORMONAL-BALANCE-ADVICE-MANAGER-PROCESSING]`);
          let title, body = '';
          let template: { title: string, body: string };

          const currentMonthPredictedPeriodLog: MonthlyPeriodInfo | null = await this.queryBus.execute(
            new FetchUserPredictedPeriodTrackerHistoryQuery(user.id),
          );

          if (!currentMonthPredictedPeriodLog) return;

          const todayPeriodInfo = currentMonthPredictedPeriodLog?.days.find((day) => day.isToday) ?? null;

          if (!todayPeriodInfo) {
            console.log(`[FCM-DEBUG] No todayPeriodInfo for user ${user.id}`);
            return;
          }

          template = getTemplateByDay(HormonalBalanceAdviceTemplates);

          title = template.title;
          body = template.body;

          if (user.fcmToken?.length > 2 && title) {
            await FCMessaging.sendNotification(user.fcmToken, {
              title,
              body,
              data: {},
            });
          }

          this.logger.log(`[MORNING-HORMONAL-BALANCE-ADVICE-MANAGER-SUCCESS]`);
        } catch (error) {
          this.logger.error(`[MORNING-HORMONAL-BALANCE-ADVICE-MANAGER-ERROR] :: ${error}`);
        }
      }));

      this.logger.log(`[MORNING-HORMONAL-BALANCE-ADVICE-CRONJOB-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[MORNING-HORMONAL-BALANCE-ADVICE-CRONJOB-ERROR] :: ${error}`);
    }
  }

  // !AFTERNOON -> INFECTION PREVENTION REMEDY NOTIFICATION
  // @Cron('*/60 * * * * *', { timeZone: 'Africa/Lagos' })
  @Cron('05 14 * * *', { timeZone: 'Africa/Lagos' })
  async afternoonInfectionPreventionRemedyCronHandler() {
    try {
      this.logger.log(`[AFTERNOON-INFECTION-PREVENTION-REMEDY-CRONJOB-PROCESSING]`);

      const users = await this.accountRepository.find();

      await Promise.all(users.map(async (user) => {
        try {
          this.logger.log(`[AFTERNOON-INFECTION-PREVENTION-REMEDY-MANAGER-PROCESSING]`);
          let title, body = '';
          let template: { title: string, body: string };

          const currentMonthPredictedPeriodLog: MonthlyPeriodInfo | null = await this.queryBus.execute(
            new FetchUserPredictedPeriodTrackerHistoryQuery(user.id),
          );

          if (!currentMonthPredictedPeriodLog) return;

          const todayPeriodInfo = currentMonthPredictedPeriodLog?.days.find((day) => day.isToday) ?? null;

          if (!todayPeriodInfo) {
            console.log(`[FCM-DEBUG] No todayPeriodInfo for user ${user.id}`);
            return;
          }

          template = getRotationTemplate(InfectionPreventionRemedyTemplates);

          title = template.title;
          body = template.body;

          if (user.fcmToken?.length > 2 && title) {
            await FCMessaging.sendNotification(user.fcmToken, {
              title,
              body,
              data: {},
            });
          }

          this.logger.log(`[AFTERNOON-INFECTION-PREVENTION-REMEDY-MANAGER-SUCCESS]`);
        } catch (error) {
          this.logger.error(`[AFTERNOON-INFECTION-PREVENTION-REMEDY-MANAGER-ERROR] :: ${error}`);
        }
      }));

      this.logger.log(`[AFTERNOON-INFECTION-PREVENTION-REMEDY-CRONJOB-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[AFTERNOON-INFECTION-PREVENTION-REMEDY-CRONJOB-ERROR] :: ${error}`);
    }
  }

  // !EVENING -> ORDER VENILLE SANITARY PADS NOTIFICATION
  // @Cron('*/60 * * * * *', { timeZone: 'Africa/Lagos' })
  @Cron('05 18 * * *', { timeZone: 'Africa/Lagos' })
  async eveningOrderVenilleSanitaryPadsCronHandler() {
    try {
      this.logger.log(`[EVENING-ORDER-VENILLE-SANITARY-PADS-CRONJOB-PROCESSING]`);

      const users = await this.accountRepository.find();

      await Promise.all(users.map(async (user) => {
        try {
          this.logger.log(`[EVENING-ORDER-VENILLE-SANITARY-PADS-MANAGER-PROCESSING]`);
          let title, body = '';
          let template: { title: string, body: string };

          const currentMonthPredictedPeriodLog: MonthlyPeriodInfo | null = await this.queryBus.execute(
            new FetchUserPredictedPeriodTrackerHistoryQuery(user.id),
          );

          if (!currentMonthPredictedPeriodLog) return;

          const todayPeriodInfo = currentMonthPredictedPeriodLog?.days.find((day) => day.isToday) ?? null;

          if (!todayPeriodInfo) {
            console.log(`[FCM-DEBUG] No todayPeriodInfo for user ${user.id}`);
            return;
          }

          template = getRotationTemplate(VenillePadsMarketingTemplates);

          title = template.title;
          body = template.body;

          if (user.fcmToken?.length > 2 && title) {
            await FCMessaging.sendNotification(user.fcmToken, {
              title,
              body,
              data: {},
            });
          }

          this.logger.log(`[EVENING-ORDER-VENILLE-SANITARY-PADS-MANAGER-SUCCESS]`);
        } catch (error) {
          this.logger.error(`[EVENING-ORDER-VENILLE-SANITARY-PADS-MANAGER-ERROR] :: ${error}`);
        }
      }));

      this.logger.log(`[EVENING-ORDER-VENILLE-SANITARY-PADS-CRONJOB-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[EVENING-ORDER-VENILLE-SANITARY-PADS-CRONJOB-ERROR] :: ${error}`);
    }
  }
}
