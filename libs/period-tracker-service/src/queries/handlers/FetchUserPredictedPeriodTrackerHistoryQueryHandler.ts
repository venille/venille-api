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
  PeriodTrackerHistory,
} from '@app/common/src/models/period.record.model';
import {
  generateDailyInsight,
  calculateCycleDayCount,
  calculateFollicularPhaseLength,
} from '@app/common/src/calculator/period.calculator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Account } from '@app/common/src/models/account.model';
import { MenstrualPhase } from '@app/common/src/constants/enums';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { FetchUserPredictedPeriodTrackerHistoryQuery } from '../impl';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';
import { PeriodTrackerRecord } from '@app/common/src/models/period.record.model';
import { PredictedYearTrackerInfo } from '@app/common/src/models/period.record.model';

@QueryHandler(FetchUserPredictedPeriodTrackerHistoryQuery)
export class FetchUserPredictedPeriodTrackerHistoryQueryHandler
  implements
    IQueryHandler<FetchUserPredictedPeriodTrackerHistoryQuery, MonthlyPeriodInfo | null>
{
  constructor(
    private readonly queryBus: QueryBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(PeriodTracker)
    private readonly periodTrackerRepository: Repository<PeriodTracker>,
    @InjectRepository(PeriodTrackerRecord)
    private readonly periodTrackerRecordRepository: Repository<PeriodTrackerRecord>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(
    query: FetchUserPredictedPeriodTrackerHistoryQuery,
  ): Promise<MonthlyPeriodInfo | null> {
    try {
      const { accountId } = query;

      this.logger.log(
        `[FETCH-PREDICTED-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      // Fetch tracker settings and all period records
      const [periodTracker, periodRecords] = await Promise.all([
        this.periodTrackerRepository.findOne({
          where: { account: { id: accountId } },
        }),
        this.periodTrackerRecordRepository.find({
          where: { account: { id: accountId } },
          order: { startDate: 'ASC' },
        }),
      ]);

      if (!periodTracker || !periodRecords.length) {
        return null;
      }

      // Use the earliest record as the baseline for cycle arithmetic
      const baseline = periodRecords[0];
      const baselineStartDate = new Date(baseline.startDate);
      const cycleLengthDays = periodTracker.cycleLengthDays;
      const periodLengthDays = differenceInDays(
        baseline.endDate,
        baseline.startDate,
      );

      // ---------------------------------------------------------------
      // Determine which month to return:
      // Find the predicted period start for the current cycle, then use
      // its month. If today is already past the predicted period end,
      // advance one full cycle so we always show the current/next period.
      // ---------------------------------------------------------------
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const todayMidnight = new Date(todayStr + 'T00:00:00.000Z');
      const baselineStr = baselineStartDate.toISOString().split('T')[0];
      const baselineMidnight = new Date(baselineStr + 'T00:00:00.000Z');

      const daysSinceBaseline = differenceInDays(todayMidnight, baselineMidnight);
      const currentCycleNumber = Math.floor(daysSinceBaseline / cycleLengthDays);
      let predictedPeriodStart = addDays(baselineStartDate, currentCycleNumber * cycleLengthDays);
      let predictedPeriodEnd = addDays(predictedPeriodStart, periodLengthDays);

      // If today is already past this predicted period, advance to the next cycle
      if (isBefore(predictedPeriodEnd, today)) {
        predictedPeriodStart = addDays(predictedPeriodStart, cycleLengthDays);
        predictedPeriodEnd = addDays(predictedPeriodStart, periodLengthDays);
      }

      // The target month is the month containing the predicted period start
      const targetMonthStart = startOfMonth(predictedPeriodStart);
      const targetMonthIndex = targetMonthStart.getMonth();
      const targetYear = targetMonthStart.getFullYear();
      const monthName = targetMonthStart.toLocaleString('default', { month: 'long' });

      // Build the MonthlyPeriodInfo for that month
      const monthInfo = this.buildMonthInfo({
        year: targetYear,
        monthIndex: targetMonthIndex,
        monthName,
        periodRecords,
        lastPeriodStartDate: baselineStartDate,
        cycleLengthDays,
        periodLengthDays,
      });

      this.logger.log(
        `[FETCH-PREDICTED-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-SUCCESS]`,
      );

      return monthInfo;
    } catch (error) {
      this.logger.log(
        `[FETCH-PREDICTED-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }

  /**
   * Builds the full day-by-day MonthlyPeriodInfo for a given year/month,
   * applying the same cycle prediction logic as the original handler.
   */
  private buildMonthInfo(params: {
    year: number;
    monthIndex: number;
    monthName: string;
    periodRecords: PeriodTrackerRecord[];
    lastPeriodStartDate: Date;
    cycleLengthDays: number;
    periodLengthDays: number;
  }): MonthlyPeriodInfo {
    const {
      year,
      monthIndex,
      monthName,
      periodRecords,
      lastPeriodStartDate,
      cycleLengthDays,
      periodLengthDays,
    } = params;

    const monthStart = startOfMonth(new Date(year, monthIndex, 1));
    const monthEnd = endOfMonth(monthStart);
    const days: PeriodDayInfo[] = [];
    let currentDate = monthStart;
    let previousCycleDayCount = 0;

    while (currentDate <= monthEnd) {
      // Skip days before the very first period record
      if (isBefore(currentDate, lastPeriodStartDate)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      const currentDateStr = currentDate.toISOString().split('T')[0];

      // Is this date within an actual logged period?
      const isWithinActualPeriod = periodRecords.some((record) => {
        const startStr = new Date(record.startDate).toISOString().split('T')[0];
        const endStr = new Date(record.endDate).toISOString().split('T')[0];
        return currentDateStr >= startStr && currentDateStr <= endStr;
      });

      // Does this month already have an actual period start logged?
      const monthHasActualPeriod = periodRecords.some((record) => {
        const recordStart = new Date(record.startDate);
        return (
          recordStart.getMonth() === monthIndex &&
          recordStart.getFullYear() === year
        );
      });

      // Most recent actual period at or before today (used as the cycle baseline)
      const mostRecentActualPeriod = periodRecords
        .filter((r) => new Date(r.startDate).toISOString().split('T')[0] <= currentDateStr)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

      const baselineStartDate = mostRecentActualPeriod
        ? new Date(mostRecentActualPeriod.startDate)
        : lastPeriodStartDate;

      // Predicted cycle start / period window for this date
      const { cycleStartDate: predictedCycleStart } = calculateCycleDayCount(
        currentDate,
        baselineStartDate,
        cycleLengthDays,
      );
      const predictedPeriodStart = predictedCycleStart;
      const predictedPeriodEnd = addDays(predictedPeriodStart, periodLengthDays);

      let isPredictedPeriodDay: boolean;
      if (isWithinActualPeriod) {
        isPredictedPeriodDay = true;
      } else if (monthHasActualPeriod) {
        isPredictedPeriodDay = false;
      } else {
        isPredictedPeriodDay = isWithinInterval(currentDate, {
          start: predictedPeriodStart,
          end: predictedPeriodEnd,
        });
      }

      // --- Cycle day calculation ---
      const baselineStr = baselineStartDate.toISOString().split('T')[0];
      const currentDateMidnight = new Date(currentDateStr + 'T00:00:00.000Z');
      const baselineStartMidnight = new Date(baselineStr + 'T00:00:00.000Z');
      const daysSinceBaseline = differenceInDays(currentDateMidnight, baselineStartMidnight);

      const isFirstDayOfActualPeriod = periodRecords.some(
        (r) => new Date(r.startDate).toISOString().split('T')[0] === currentDateStr,
      );

      let cycleDay: number;
      let cycleStartDate: Date;

      if (isFirstDayOfActualPeriod) {
        cycleDay = 1;
        cycleStartDate = currentDate;
      } else if (isPredictedPeriodDay) {
        const actualPeriod = periodRecords.find((r) => {
          const s = new Date(r.startDate).toISOString().split('T')[0];
          const e = new Date(r.endDate).toISOString().split('T')[0];
          return currentDateStr >= s && currentDateStr <= e;
        });

        if (actualPeriod) {
          const periodStart = new Date(actualPeriod.startDate);
          const periodStartMidnight = new Date(
            periodStart.toISOString().split('T')[0] + 'T00:00:00.000Z',
          );
          cycleDay = differenceInDays(currentDateMidnight, periodStartMidnight) + 1;
          cycleStartDate = periodStart;
        } else {
          const cycleNumber = Math.floor(daysSinceBaseline / cycleLengthDays);
          const dayInCycle = daysSinceBaseline % cycleLengthDays;
          if (dayInCycle === 0) {
            cycleDay = 1;
            cycleStartDate = currentDate;
          } else {
            cycleDay = dayInCycle + 1;
            cycleStartDate = addDays(baselineStartDate, cycleNumber * cycleLengthDays);
          }
        }
      } else {
        const cycleNumber = Math.floor(daysSinceBaseline / cycleLengthDays);
        cycleStartDate = addDays(baselineStartDate, cycleNumber * cycleLengthDays);
        cycleDay = (daysSinceBaseline % cycleLengthDays) + 1;
      }

      // Ovulation & fertile window
      const follicularPhaseLength = calculateFollicularPhaseLength(cycleLengthDays);
      const ovulationDate = addDays(cycleStartDate, follicularPhaseLength);
      const isPredictedOvulationDay = isSameDay(currentDate, ovulationDate);
      const fertileWindowStart = addDays(ovulationDate, -3);
      const fertileWindowEnd = addDays(ovulationDate, 2);
      const isFertileWindow = isWithinInterval(currentDate, {
        start: fertileWindowStart,
        end: fertileWindowEnd,
      });

      // Menstrual phase (used only internally — not exposed in MonthlyPeriodInfo)
      const periodStartDate = cycleStartDate;
      const periodEndDate = addDays(periodStartDate, periodLengthDays);
      let currentPhase: MenstrualPhase = MenstrualPhase.LUTEAL_PHASE;
      if (isWithinInterval(currentDate, { start: periodStartDate, end: periodEndDate })) {
        currentPhase = MenstrualPhase.MENSTRUAL_PHASE;
      } else if (
        isWithinInterval(currentDate, {
          start: addDays(periodEndDate, 1),
          end: addDays(fertileWindowStart, -1),
        })
      ) {
        currentPhase = MenstrualPhase.FOLLICULAR_PHASE;
      } else if (isWithinInterval(currentDate, { start: fertileWindowStart, end: fertileWindowEnd })) {
        currentPhase = MenstrualPhase.OVULATION_PHASE;
      }

      // Correction: if cycleDay erroneously rolls to 1 mid-cycle, continue from previous count
      if (cycleDay === 1 && !isPredictedPeriodDay && previousCycleDayCount > 0) {
        cycleDay = previousCycleDayCount + 1;
        cycleStartDate = addDays(currentDate, -(cycleDay - 1));
      }

      const insights = generateDailyInsight({
        currentDate,
        periodStartDate: cycleStartDate,
        periodEndDate: addDays(cycleStartDate, periodLengthDays),
        ovulationDate,
        cycleStartDate,
        cycleLengthDays,
      });

      days.push({
        date: currentDate,
        isLoggedPeriodDay: periodRecords.some((r) => {
          const s = new Date(r.startDate).toISOString().split('T')[0];
          const e = new Date(r.endDate).toISOString().split('T')[0];
          return currentDateStr >= s && currentDateStr <= e;
        }),
        cycleDayCount: cycleDay > 0 ? cycleDay : 1,
        isToday: isSameDay(currentDate, new Date()),
        isPredictedPeriodDay,
        isFertileWindow,
        isPredictedOvulationDay,
        insights,
        currentPhase,
      });

      previousCycleDayCount = cycleDay;
      currentDate = addDays(currentDate, 1);
    }

    return {
      month: monthIndex,
      monthName,
      days,
    };
  }
}
