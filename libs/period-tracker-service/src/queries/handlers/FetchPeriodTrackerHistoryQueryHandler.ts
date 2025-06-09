import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PeriodSymptomLog,
  PeriodTrackerInfo,
  PeriodTrackerRecord,
  DailyInsightsSummary,
  PeriodOvulationPrediction,
  PeriodTrackerReminderInfo,
} from '@app/common/src/models/period.record.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FetchPeriodTrackerHistoryQuery } from '../impl';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';

@QueryHandler(FetchPeriodTrackerHistoryQuery)
export class FetchPeriodTrackerHistoryQueryHandler
  implements IQueryHandler<FetchPeriodTrackerHistoryQuery, PeriodTrackerInfo[]>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(PeriodSymptomLog)
    private readonly symptomLogRepository: Repository<PeriodSymptomLog>,
    @InjectRepository(PeriodTracker)
    private readonly periodTrackerRepository: Repository<PeriodTracker>,
    @InjectRepository(PeriodTrackerRecord)
    private readonly periodRecordRepository: Repository<PeriodTrackerRecord>,
    @InjectRepository(PeriodOvulationPrediction)
    private readonly ovulationPredictionRepository: Repository<PeriodOvulationPrediction>,
  ) {}

  async execute(
    query: FetchPeriodTrackerHistoryQuery,
  ): Promise<PeriodTrackerInfo[]> {
    try {
      const { secureUser } = query;

      const cacheKey = `period_tracker_history_${secureUser.id}`;

      const cachedResult =
        await this.cacheManager.get<PeriodTrackerInfo[]>(cacheKey);
      if (cachedResult) {
        this.logger.log(
          `[FETCH-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-CACHE-HIT]: ${cacheKey}`,
        );
        // return cachedResult;
      }

      this.logger.log(
        `[FETCH-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      const today = new Date();
      const currentYear = today.getFullYear();

      // Get user's period tracker settings
      const periodTracker = await this.periodTrackerRepository.findOne({
        where: {
          account: { id: secureUser.id },
        },
      });

      const periodData = await this.periodRecordRepository.find({
        where: {
          account: { id: secureUser.id },
        },
        order: {
          startDate: 'DESC',
        },
      });

      const symptoms = await this.symptomLogRepository.find({
        where: {
          account: { id: secureUser.id },
        },
      });

      const lastPeriod = periodData[0];

      const ovulationPrediction =
        await this.ovulationPredictionRepository.findOne({
          where: {
            account: { id: secureUser.id },
          },
        });

      const ovulationDate = ovulationPrediction?.ovulationDate;

      this.logger.log(`[DEBUG] Found ${periodData.length} period records`);
      this.logger.log(
        `[DEBUG] Period tracker settings: ${
          periodTracker
            ? JSON.stringify({
                cycleLengthDays: periodTracker.cycleLengthDays,
                periodLengthDays: periodTracker.periodLengthDays,
                lastPeriodStartDate: periodTracker.lastPeriodStartDate,
              })
            : 'null'
        }`,
      );
      this.logger.log(
        `[DEBUG] Last period: ${
          lastPeriod
            ? JSON.stringify({
                startDate: lastPeriod.startDate,
                isPredicted: lastPeriod.isPredicted,
              })
            : 'null'
        }`,
      );
      this.logger.log(
        `[DEBUG] Ovulation date: ${ovulationDate ? ovulationDate.toString() : 'null'}`,
      );

      // Use period tracker settings or defaults
      const cycleLengthDays = periodTracker?.cycleLengthDays || 28;
      const periodLengthDays = periodTracker?.periodLengthDays || 5;

      this.logger.log(`[DEBUG] Using cycle length: ${cycleLengthDays} days`);
      this.logger.log(`[DEBUG] Using period length: ${periodLengthDays} days`);

      // Generate predicted period dates for the next 6 cycles
      const generatePredictedPeriods = () => {
        const predictedPeriods: {
          dates: string[];
          month: number;
          ovulationDate: string;
        }[] = [];

        // Use the most recent actual period, lastPeriodStartDate from tracker, or any period
        const basePeriod = periodData.find((p) => !p.isPredicted) || lastPeriod;
        const basePeriodStartDate =
          basePeriod?.startDate || periodTracker?.lastPeriodStartDate;

        this.logger.log(
          `[DEBUG] Base period for predictions: ${basePeriodStartDate ? basePeriodStartDate.toString() : 'null'}`,
        );

        if (basePeriodStartDate) {
          const basePeriodDate = new Date(basePeriodStartDate);
          this.logger.log(
            `[DEBUG] Using base period: ${basePeriodDate.toISOString()}`,
          );

          // Calculate the start of the current cycle
          const today = new Date();
          const daysSinceBase = Math.floor(
            (today.getTime() - basePeriodDate.getTime()) /
              (24 * 60 * 60 * 1000),
          );
          const cyclesSinceBase = Math.floor(daysSinceBase / cycleLengthDays);
          const currentCycleStart = new Date(
            basePeriodDate.getTime() +
              cyclesSinceBase * cycleLengthDays * 24 * 60 * 60 * 1000,
          );

          // Generate next 6 cycles from the current cycle
          for (let cycle = 0; cycle <= 6; cycle++) {
            // Calculate cycle start date for this cycle
            const cycleStartDate = new Date(
              currentCycleStart.getTime() +
                cycleLengthDays * cycle * 24 * 60 * 60 * 1000,
            );

            // Calculate ovulation date (14 days before period start)
            const ovulationDate = new Date(
              cycleStartDate.getTime() +
                (cycleLengthDays - 14) * 24 * 60 * 60 * 1000,
            );

            // Period starts at the end of each cycle
            const periodStartDate = new Date(
              cycleStartDate.getTime() +
                (cycleLengthDays - periodLengthDays) * 24 * 60 * 60 * 1000,
            );

            // Generate period days for this cycle
            const cyclePeriodDates: string[] = [];
            for (let day = 0; day < periodLengthDays; day++) {
              const periodDay = new Date(
                periodStartDate.getTime() + day * 24 * 60 * 60 * 1000,
              );
              cyclePeriodDates.push(periodDay.toISOString().split('T')[0]);
            }

            // Group period days by month (may span multiple months)
            for (const dateStr of cyclePeriodDates) {
              const date = new Date(dateStr);
              const month = date.getMonth();

              // Only include dates from current year
              if (date.getFullYear() === currentYear) {
                const existingMonth = predictedPeriods.find(
                  (p) => p.month === month,
                );
                if (existingMonth) {
                  existingMonth.dates.push(dateStr);
                } else {
                  predictedPeriods.push({
                    dates: [dateStr],
                    month: month,
                    ovulationDate:
                      ovulationDate.getMonth() === month
                        ? ovulationDate.toISOString().split('T')[0]
                        : '',
                  });
                }
              }
            }
          }

          // Sort dates within each month
          for (const monthData of predictedPeriods) {
            monthData.dates.sort();
          }
        }

        return predictedPeriods;
      };

      const predictedPeriods = generatePredictedPeriods();

      // Generate reminders for predicted periods and ovulation days
      const generateReminders = (monthIndex: number) => {
        const monthReminders: PeriodTrackerReminderInfo[] = [];
        const monthPredictedData = predictedPeriods.find(
          (p) => p.month === monthIndex,
        );

        if (monthPredictedData) {
          // Sort the dates to get the first day of predicted period
          const sortedDates = [...monthPredictedData.dates].sort();
          if (sortedDates.length > 0) {
            // Add period start reminder
            monthReminders.push({
              title: 'Period Start',
              reminderTime: `${sortedDates[0]}T00:00:00.000Z`,
              isRecurring: true,
              daysOfWeek: [],
            });
          }

          // Add ovulation reminder if available
          if (monthPredictedData.ovulationDate) {
            monthReminders.push({
              title: 'Ovulation Day',
              reminderTime: `${monthPredictedData.ovulationDate}T00:00:00.000Z`,
              isRecurring: true,
              daysOfWeek: [],
            });
          }
        }

        return monthReminders;
      };

      // Calculate ovulation date for current cycle
      let calculatedOvulationDate: Date | null = null;
      if (
        !ovulationDate &&
        (lastPeriod?.startDate || periodTracker?.lastPeriodStartDate)
      ) {
        const lastPeriodDate = new Date(
          lastPeriod?.startDate || periodTracker.lastPeriodStartDate,
        );

        // Calculate days since last period
        const daysSinceLastPeriod = Math.floor(
          (today.getTime() - lastPeriodDate.getTime()) / (24 * 60 * 60 * 1000),
        );

        // Calculate current cycle start
        const currentCycleNumber = Math.floor(
          daysSinceLastPeriod / cycleLengthDays,
        );
        const currentCycleStart = new Date(
          lastPeriodDate.getTime() +
            currentCycleNumber * cycleLengthDays * 24 * 60 * 60 * 1000,
        );

        // Ovulation occurs 14 days before the next period
        calculatedOvulationDate = new Date(
          currentCycleStart.getTime() +
            (cycleLengthDays - 14) * 24 * 60 * 60 * 1000,
        );

        this.logger.log(
          `[DEBUG] Calculated ovulation date: ${calculatedOvulationDate.toISOString()}`,
        );
      }

      // Ensure we always have a Date object or null
      const effectiveOvulationDate: Date | null = ovulationDate
        ? new Date(ovulationDate)
        : calculatedOvulationDate;

      this.logger.log(
        `[DEBUG] Effective ovulation date: ${effectiveOvulationDate ? effectiveOvulationDate.toISOString() : 'null'}`,
      );

      // Generate PeriodTrackerInfo for each month of the current year
      const result: PeriodTrackerInfo[] = Array.from(
        { length: 12 },
        (_, monthIndex) => {
          const monthDate = new Date(currentYear, monthIndex, 1);
          const monthString = monthDate.toLocaleString('default', {
            month: 'long',
          });

          // Get predicted periods and ovulation date for this month
          const monthPredictedPeriodData = predictedPeriods.find(
            (p) => p.month === monthIndex,
          );
          const monthPredictedPeriods = monthPredictedPeriodData
            ? monthPredictedPeriodData.dates
            : [];
          const monthOvulationDate =
            monthPredictedPeriodData?.ovulationDate || '';

          // Generate reminders for this month
          const monthReminders = generateReminders(monthIndex);

          // Get symptoms for current month's today
          let symptomsLoggedToday: string[] = [];
          if (monthIndex === today.getMonth()) {
            const todayString = today.toISOString().split('T')[0];
            const todaySymptoms = symptoms.find(
              (symptom) =>
                symptom.date &&
                symptom.date.toISOString().split('T')[0] === todayString,
            );
            symptomsLoggedToday =
              todaySymptoms?.symptoms?.split(',').filter((s) => s.trim()) || [];
          }

          // Calculate ovulation countdown for current month
          let ovulationInDays = 0;
          let isOvulationToday = false;

          if (effectiveOvulationDate && monthIndex === today.getMonth()) {
            const ovulationTime = effectiveOvulationDate.getTime();
            const todayTime = today.getTime();
            ovulationInDays = Math.ceil(
              (ovulationTime - todayTime) / (1000 * 60 * 60 * 24),
            );
            isOvulationToday = ovulationInDays === 0;
          }

          // Get last period info for current month
          const lastPeriodInfo =
            monthIndex === today.getMonth() && lastPeriod
              ? {
                  startDate: new Date(lastPeriod.startDate)
                    .toISOString()
                    .split('T')[0],
                  endDate: lastPeriod.endDate
                    ? new Date(lastPeriod.endDate).toISOString().split('T')[0]
                    : new Date(
                        lastPeriod.startDate.getTime() +
                          (periodLengthDays - 1) * 24 * 60 * 60 * 1000,
                      )
                        .toISOString()
                        .split('T')[0],
                  isPredicted: lastPeriod.isPredicted,
                }
              : {
                  startDate: '',
                  endDate: '',
                  isPredicted: false,
              };

          // Generate daily insights for current month
          const generateDailyInsights = () => {
            if (monthIndex !== today.getMonth()) {
              return [];
            }

            const insights: DailyInsightsSummary[] = [];
            const daysInMonth = new Date(
              currentYear,
              monthIndex + 1,
              0,
            ).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
              const currentDate = new Date(currentYear, monthIndex, day);
              const dateString = currentDate.toISOString().split('T')[0];

              const isPredictedPeriodDay =
                monthPredictedPeriods.includes(dateString);
              const isPredictedOvulationDay = monthOvulationDate === dateString;

              // Calculate days to ovulation for this specific date
              let daysToOvulation = 0;
              if (effectiveOvulationDate) {
                const ovulationTime = effectiveOvulationDate.getTime();
                const currentTime = currentDate.getTime();
                daysToOvulation = Math.ceil(
                  (ovulationTime - currentTime) / (1000 * 60 * 60 * 24),
                );
              }

              let dayInsights = '';
              if (isPredictedPeriodDay) {
                dayInsights = 'Predicted period day';
              } else if (isPredictedOvulationDay) {
                dayInsights = 'Predicted ovulation day - peak fertility window';
              } else if (daysToOvulation <= 7 && daysToOvulation > 0) {
                dayInsights = `Ovulation in ${daysToOvulation} days - fertility window`;
              } else if (daysToOvulation < 0 && daysToOvulation >= -7) {
                dayInsights = 'Post-ovulation phase - lower fertility';
              } else if (daysToOvulation <= -8) {
                dayInsights = 'Late luteal phase - period approaching';
              } else {
                dayInsights = 'Regular cycle day';
              }

              insights.push({
                date: currentDate,
                isPredictedPeriodDay,
                isPredictedOvulationDay,
                todayInsights: dayInsights,
              });
            }

            return insights;
          };

          const dailyInsights = generateDailyInsights();

          return {
            today:
              monthIndex === today.getMonth()
                ? today.toISOString().split('T')[0]
                : '',
            calendar: {
              currentMonth: monthString,
              currentYear: currentYear,
              predictedPeriodDays: monthPredictedPeriods,
              ovulationDate: monthOvulationDate,
              dailyInsights: dailyInsights,
            },
            ovulationCountdown: {
              ovulationInDays,
              isToday: isOvulationToday,
            },
            symptomsLoggedToday,
            reminders: monthReminders,
            lastPeriod: lastPeriodInfo,
          };
        },
      );

      const CACHE_TTL_MS = 1 * 60 * 1000; // 1 minute
      await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);

      this.logger.log(`[FETCH-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-SUCCESS]`);

      return result;
    } catch (error) {
      this.logger.log(
        `[FETCH-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}
