import {
  addDays,
  isBefore,
  isSameDay,
  endOfMonth,
  startOfMonth,
  differenceInDays,
  isWithinInterval,
} from 'date-fns';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PeriodDayInfo,
  MonthlyPeriodInfo,
  PredictedYearTrackerInfo,
} from '@app/common/src/models/period.record.model';
import {
  predictPeriodLength,
  estimateOvulationDate,
  calculateCycleDayCount,
} from '@app/common/src/calculator/period.calculator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FetchPredictedPeriodTrackerHistoryQuery } from '../impl';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';
import { PeriodTrackerRecord } from '@app/common/src/models/period.record.model';

@QueryHandler(FetchPredictedPeriodTrackerHistoryQuery)
export class FetchPredictedPeriodTrackerHistoryQueryHandler
  implements
    IQueryHandler<
      FetchPredictedPeriodTrackerHistoryQuery,
      PredictedYearTrackerInfo
    >
{
  constructor(
    private readonly queryBus: QueryBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(PeriodTracker)
    private readonly periodTrackerRepository: Repository<PeriodTracker>,
    @InjectRepository(PeriodTrackerRecord)
    private readonly periodRecordRepository: Repository<PeriodTrackerRecord>,
  ) {}

  async execute(
    query: FetchPredictedPeriodTrackerHistoryQuery,
  ): Promise<PredictedYearTrackerInfo> {
    try {
      const { secureUser } = query;

      this.logger.log(
        `[FETCH-PREDICTED-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      // Get current year start and end dates
      const currentYear = new Date().getFullYear();

      // Get user's period tracker settings and history
      const [periodTracker, periodRecords] = await Promise.all([
        this.periodTrackerRepository.findOne({
          where: { account: { id: secureUser.id } },
        }),
        this.periodRecordRepository.find({
          where: { account: { id: secureUser.id } },
          order: { startDate: 'ASC' },
        }),
      ]);

      if (!periodTracker || !periodRecords.length) {
        return {
          currentYear,
          months: [],
        };
      }

      // Get the last actual period record
      const lastPeriod = periodRecords[0];
      const lastPeriodStartDate = new Date(lastPeriod.startDate);
      const cycleLengthDays = periodTracker.cycleLengthDays;
      const periodLengthDays = predictPeriodLength(
        periodRecords.map((record) => ({
          start: new Date(record.startDate),
          end: new Date(record.endDate),
        })),
        5,
      );

      console.log('[PERIOD-LENGTH-DAYS] :: ', periodLengthDays);

      // Only include months from last period start date onwards
      const startMonth = lastPeriodStartDate.getMonth();
      const months: MonthlyPeriodInfo[] = [];

      // Generate monthly information only for months after last period start
      for (let monthIndex = startMonth; monthIndex < 12; monthIndex++) {
        const monthStart = startOfMonth(new Date(currentYear, monthIndex, 1));

        // Skip if month start is before last period
        if (isBefore(monthStart, startOfMonth(lastPeriodStartDate))) {
          continue;
        }

        const monthEnd = endOfMonth(monthStart);
        const monthName = monthStart.toLocaleString('default', {
          month: 'long',
        });
        const days: PeriodDayInfo[] = [];

        // Calculate base date for cycle counting
        let currentDate = monthStart;
        while (currentDate <= monthEnd) {
          // Calculate cycle information for this date
          const { cycleDay, cycleStartDate } = calculateCycleDayCount(
            currentDate,
            lastPeriodStartDate,
            cycleLengthDays,
          );

          // Skip days before last period start date
          if (isBefore(currentDate, lastPeriodStartDate)) {
            currentDate = addDays(currentDate, 1);
            continue;
          }

          // For each date, calculate period and ovulation based on its cycle
          const periodStartDate = cycleStartDate;
          const periodEndDate = addDays(periodStartDate, periodLengthDays);

          // Calculate ovulation date for this specific cycle using estimateOvulationDate
          // For each cycle, we need to calculate what the "previous period start" would be
          // The previous period start for this cycle would be one cycle length before
          const previousPeriodStartForThisCycle = addDays(
            cycleStartDate,
            -cycleLengthDays,
          );

          const ovulationDate = estimateOvulationDate(
            cycleStartDate, // Current cycle's start date
            previousPeriodStartForThisCycle, // Previous period start for this cycle
            cycleLengthDays, // Fallback cycle length
          );

          // Check if current date is within predicted period
          const isPredictedPeriodDay =
            isWithinInterval(currentDate, {
              start: periodStartDate,
              end: periodEndDate,
            }) ||
            // Also check if it's within any actual period record
            periodRecords.some((record) =>
              isWithinInterval(currentDate, {
                start: new Date(record.startDate),
                end: new Date(record.endDate),
              }),
            );

          // Check if current date is the ovulation day for this cycle
          const isPredictedOvulationDay = isSameDay(currentDate, ovulationDate);

          // Generate insights based on cycle phase
          let insights = 'Regular cycle day';
          if (isPredictedPeriodDay) {
            const periodDayCount =
              differenceInDays(currentDate, periodStartDate) + 1;
            insights = `Period day ${periodDayCount}\n\nLow chances of getting pregnant`;
          } else if (isPredictedOvulationDay) {
            insights =
              'Prediction: Day of\n\nOvulation\nHigh chance of getting pregnant';
          } else {
            const daysToNextPeriod = differenceInDays(
              addDays(cycleStartDate, cycleLengthDays),
              currentDate,
            );
            if (daysToNextPeriod > 0) {
              insights = `Period in\n${daysToNextPeriod} days\nLow chances of getting pregnant`;
            }
          }

          days.push({
            insights,
            date: currentDate,
            isPredictedPeriodDay,
            isPredictedOvulationDay,
            cycleDayCount: cycleDay,
            isToday: isSameDay(currentDate, new Date()),
          });

          currentDate = addDays(currentDate, 1);
        }

        // Only add month if it has days
        if (days.length > 0) {
          months.push({
            month: monthIndex,
            monthName,
            days,
          });
        }
      }

      this.logger.log(
        `[FETCH-PREDICTED-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-SUCCESS]`,
      );

      return {
        currentYear,
        months,
      };
    } catch (error) {
      this.logger.log(
        `[FETCH-PREDICTED-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}
