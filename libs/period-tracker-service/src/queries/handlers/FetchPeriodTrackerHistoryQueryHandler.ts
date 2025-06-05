import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PeriodOvulationPrediction,
  PeriodSymptomLog,
  PeriodTrackerInfo,
  PeriodTrackerRecord,
} from '@app/common/src/models/period.record.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FetchPeriodTrackerHistoryQuery } from '../impl';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';

@QueryHandler(FetchPeriodTrackerHistoryQuery)
export class FetchPeriodTrackerHistoryQueryHandler
  implements IQueryHandler<FetchPeriodTrackerHistoryQuery, PeriodTrackerInfo[]>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(PeriodSymptomLog)
    private readonly symptomLogRepository: Repository<PeriodSymptomLog>,
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
        `[DEBUG] Ovulation date: ${ovulationDate ? ovulationDate.toISOString() : 'null'}`,
      );

      // Calculate average cycle length from historical data
      let averageCycleLength = 28; // Default cycle length
      if (periodData.length >= 2) {
        const actualPeriods = periodData.filter((p) => !p.isPredicted);
        this.logger.log(`[DEBUG] Found ${actualPeriods.length} actual periods`);

        if (actualPeriods.length >= 2) {
          let totalDays = 0;
          let cycleCount = 0;
          for (let i = 0; i < actualPeriods.length - 1; i++) {
            const currentPeriod = new Date(actualPeriods[i].startDate);
            const nextPeriod = new Date(actualPeriods[i + 1].startDate);
            const daysDiff = Math.abs(
              (currentPeriod.getTime() - nextPeriod.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            if (daysDiff > 0 && daysDiff <= 45) {
              // Reasonable cycle length
              totalDays += daysDiff;
              cycleCount++;
            }
          }
          if (cycleCount > 0) {
            averageCycleLength = Math.round(totalDays / cycleCount);
          }
        }
      }

      this.logger.log(
        `[DEBUG] Average cycle length: ${averageCycleLength} days`,
      );

      // Generate predicted period dates for the next 6 cycles
      const generatePredictedPeriods = () => {
        const predictedPeriods: { date: Date; month: number }[] = [];

        // Use the most recent actual period, or fall back to any period
        const basePeriod = periodData.find((p) => !p.isPredicted) || lastPeriod;

        if (basePeriod) {
          const basePeriodDate = new Date(basePeriod.startDate);
          this.logger.log(
            `[DEBUG] Using base period: ${basePeriodDate.toISOString()}`,
          );

          for (let cycle = 1; cycle <= 6; cycle++) {
            const predictedDate = new Date(
              basePeriodDate.getTime() +
                averageCycleLength * cycle * 24 * 60 * 60 * 1000,
            );
            if (predictedDate.getFullYear() === currentYear) {
              predictedPeriods.push({
                date: predictedDate,
                month: predictedDate.getMonth(),
              });
            }
          }
        }

        this.logger.log(
          `[DEBUG] Generated ${predictedPeriods.length} predicted periods`,
        );
        return predictedPeriods;
      };

      const predictedPeriods = generatePredictedPeriods();

      // Calculate ovulation date for current cycle if not available
      let calculatedOvulationDate: Date | null = null;
      if (!ovulationDate && lastPeriod) {
        // Calculate ovulation as 14 days before next expected period
        const lastPeriodDate = new Date(lastPeriod.startDate);
        const nextPeriodDate = new Date(
          lastPeriodDate.getTime() + averageCycleLength * 24 * 60 * 60 * 1000,
        );
        calculatedOvulationDate = new Date(
          nextPeriodDate.getTime() - 14 * 24 * 60 * 60 * 1000,
        );
        this.logger.log(
          `[DEBUG] Calculated ovulation date: ${calculatedOvulationDate.toISOString()}`,
        );
      }

      const effectiveOvulationDate = ovulationDate || calculatedOvulationDate;

      // Generate PeriodTrackerInfo for each month of the current year
      const result: PeriodTrackerInfo[] = Array.from(
        { length: 12 },
        (_, monthIndex) => {
          const monthDate = new Date(currentYear, monthIndex, 1);
          const monthString = monthDate.toLocaleString('default', {
            month: 'long',
          });

          // Filter periods for this specific month
          const monthPeriods = periodData.filter((entry) => {
            const entryDate = new Date(entry.startDate);
            return (
              entryDate.getMonth() === monthIndex &&
              entryDate.getFullYear() === currentYear
            );
          });

          // Get predicted periods for this month
          const monthPredictedPeriods = predictedPeriods
            .filter((p) => p.month === monthIndex)
            .map((p) => p.date.toISOString().split('T')[0]);

          // Calculate ovulation countdown for this month
          let ovulationInDays = 0;
          let isOvulationToday = false;

          if (effectiveOvulationDate) {
            const ovulationTime = new Date(effectiveOvulationDate).getTime();

            // Check if ovulation is today for current month
            if (monthIndex === today.getMonth()) {
              const todayTime = today.getTime();
              ovulationInDays = Math.ceil(
                (ovulationTime - todayTime) / (1000 * 60 * 60 * 24),
              );
              isOvulationToday = ovulationInDays === 0;
            }
          }

          // Get symptoms for this month (for current month, get today's symptoms)
          let symptomsLoggedToday: string[] = [];
          if (monthIndex === today.getMonth()) {
            const todayString = today.toISOString().split('T')[0];
            const todaySymptoms = symptoms.find(
              (symptom) =>
                symptom.date.toISOString().split('T')[0] === todayString,
            );
            symptomsLoggedToday = todaySymptoms
              ? todaySymptoms.symptoms.split(',').filter((s) => s.trim() !== '')
              : [];
          }

          const monthResult = {
            today:
              monthIndex === today.getMonth()
                ? today.toISOString().split('T')[0]
                : '',
            calendar: {
              currentMonth: monthString,
              currentYear: currentYear,
              periodDays: monthPeriods
                .filter((p) => !p.isPredicted)
                .map((p) => p.startDate.toISOString().split('T')[0]),
              predictedPeriodDays: [
                ...monthPeriods
                  .filter((p) => p.isPredicted)
                  .map((p) => p.startDate.toISOString().split('T')[0]),
                ...monthPredictedPeriods,
              ],
              ovulationDate:
                effectiveOvulationDate &&
                new Date(effectiveOvulationDate).getMonth() === monthIndex
                  ? effectiveOvulationDate.toISOString().split('T')[0]
                  : '',
            },
            ovulationCountdown: {
              ovulationInDays: ovulationInDays,
              isToday: isOvulationToday,
            },
            symptomsLoggedToday: symptomsLoggedToday,
            reminders: [], // TODO: Implement reminders fetching when reminder entity is available
            lastPeriod:
              lastPeriod && monthIndex === today.getMonth()
                ? {
                    startDate: lastPeriod.startDate.toISOString().split('T')[0],
                    endDate: lastPeriod.endDate
                      ? lastPeriod.endDate.toISOString().split('T')[0]
                      : '',
                    isPredicted: lastPeriod.isPredicted,
                  }
                : null,
          };

          // Debug log for current month
          if (monthIndex === today.getMonth()) {
            this.logger.log(
              `[DEBUG] Current month (${monthString}) result: ${JSON.stringify({
                periodDays: monthResult.calendar.periodDays,
                predictedPeriodDays: monthResult.calendar.predictedPeriodDays,
                ovulationDate: monthResult.calendar.ovulationDate,
              })}`,
            );
          }

          return monthResult;
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
