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
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';
import { MenstrualPhase } from '@app/common/src/constants/enums';
import { AppLogger } from '@app/common/src/logger/logger.service';
import FCMessaging from '@app/notification-service/src/bases/FCMessaging';
import { FetchUserPredictedPeriodTrackerHistoryQuery } from '../queries/impl';
import { MonthlyPeriodInfo, PeriodTrackerRecord } from '@app/common/src/models/period.record.model';
import { getRotationTemplate, getTemplateByDay } from '@app/common/src/helpers/push.notification.helper';
import { addDays, addMonths, isBefore, isSameDay, startOfMonth, differenceInDays } from 'date-fns';
import { HormonalBalanceAdviceTemplates, InfectionPreventionRemedyTemplates, VenillePadsMarketingTemplates } from './template/default.notification.templates';

@Injectable()
export class PeriodTrackerCronService {
  constructor(
    private readonly queryBus: QueryBus,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(PeriodTracker)
    private readonly periodTrackerRepository: Repository<PeriodTracker>,
    @InjectRepository(PeriodTrackerRecord)
    private readonly periodTrackerRecordRepository: Repository<PeriodTrackerRecord>,
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

  // !EVERYDAY -> SAVE LAST PERIOD RECORD DATE
  // @Cron('*/60 * * * * *', { timeZone: 'Africa/Lagos' })
  @Cron('00 02 * * *', { timeZone: 'Africa/Lagos' })
  async saveLastPeriodRecordDateCronHandler() {
    try {
      this.logger.log(`[SAVE-LAST-PERIOD-RECORD-DATE-CRONJOB-PROCESSING]`);

      const users = await this.accountRepository.find();

      await Promise.all(
        users.map(async (user) => {
          try {
            const [periodTracker, periodRecords] = await Promise.all([
              this.periodTrackerRepository.findOne({
                where: { account: { id: user.id } },
              }),
              this.periodTrackerRecordRepository.find({
                where: { account: { id: user.id } },
                order: { startDate: 'ASC' },
              }),
            ]);

            if (!periodTracker || !periodRecords.length) {
              return;
            }

            // Find the latest actual (non-predicted) period record
            const actualRecords = periodRecords.filter((r) => !r.isPredicted);
            if (!actualRecords.length) {
              return;
            }

            const latestActualRecord = actualRecords[actualRecords.length - 1];
            const latestActualStartDate = new Date(latestActualRecord.startDate);
            const latestActualEndDate = latestActualRecord.endDate
              ? new Date(latestActualRecord.endDate)
              : null;

            if (!latestActualEndDate) {
              return;
            }

            const cycleLengthDays = periodTracker.cycleLengthDays;
            const periodLengthDays = differenceInDays(
              latestActualEndDate,
              latestActualStartDate,
            );

            const lastRecordedMonthStart = startOfMonth(latestActualStartDate);
            const currentMonthStart = startOfMonth(new Date());

            const targetStart = startOfMonth(addMonths(lastRecordedMonthStart, 1));
            const targetEnd = startOfMonth(addMonths(currentMonthStart, -1));

            // If targetStart is after targetEnd, there are no gap months to fill
            if (isBefore(targetEnd, targetStart)) {
              return;
            }

            let k = 1;
            while (true) {
              const predictedStartDate = addDays(
                latestActualStartDate,
                k * cycleLengthDays,
              );
              const predictedEndDate = addDays(predictedStartDate, periodLengthDays);

              // If predicted start date is in or after the current month, stop generating
              if (!isBefore(predictedStartDate, currentMonthStart)) {
                break;
              }

              // Check if the predicted start date falls within the target range
              if (
                (isSameDay(predictedStartDate, targetStart) ||
                  !isBefore(predictedStartDate, targetStart)) &&
                isBefore(predictedStartDate, currentMonthStart)
              ) {
                // Check if a record already exists with the same start date
                const recordExists = periodRecords.some((r) => {
                  const rStart = new Date(r.startDate);
                  return isSameDay(rStart, predictedStartDate);
                });

                if (!recordExists) {
                  this.logger.log(
                    `[SAVE-LAST-PERIOD-RECORD-DATE-CRONJOB] Generating predicted record for user ${user.id} from ${
                      predictedStartDate.toISOString().split('T')[0]
                    } to ${predictedEndDate.toISOString().split('T')[0]}`,
                  );

                  const newRecord = this.periodTrackerRecordRepository.create({
                    account: user,
                    startDate: predictedStartDate,
                    endDate: predictedEndDate,
                    isPredicted: true,
                  });

                  await this.periodTrackerRecordRepository.save(newRecord);
                  periodRecords.push(newRecord);
                }
              }

              k++;
            }
          } catch (error) {
            this.logger.error(
              `[SAVE-LAST-PERIOD-RECORD-DATE-CRONJOB-USER-ERROR] User: ${user.id} :: ${error}`,
            );
          }
        }),
      );

      this.logger.log(`[SAVE-LAST-PERIOD-RECORD-DATE-CRONJOB-SUCCESS]`);
    } catch (error) {
      this.logger.error(
        `[SAVE-LAST-PERIOD-RECORD-DATE-CRONJOB-ERROR] :: ${error}`,
      );
    }
  }
}
