import {
  addDays,
  isBefore,
  isSameDay,
  endOfMonth,
  startOfMonth,
  startOfDay,
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
import { Account } from '@app/common/src/models/account.model';
import { MenstrualPhase } from '@app/common/src/constants/enums';
import {
  generateDailyInsight,
  calculateCycleDayCount,
  calculateFollicularPhaseLength,
} from '@app/common/src/calculator/period.calculator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FetchPredictedPeriodTrackerHistoryQuery } from '../impl';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';
import { PeriodTrackerRecord } from '@app/common/src/models/period.record.model';
import { PredictedYearTrackerInfo } from '@app/common/src/models/period.record.model';

@QueryHandler(FetchPredictedPeriodTrackerHistoryQuery)
export class FetchPredictedPeriodTrackerHistoryQueryHandler
  implements
    IQueryHandler<FetchPredictedPeriodTrackerHistoryQuery, PeriodTrackerHistory>
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
    query: FetchPredictedPeriodTrackerHistoryQuery,
  ): Promise<PeriodTrackerHistory> {
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
        this.periodTrackerRecordRepository.find({
          where: { account: { id: secureUser.id } },
          order: { startDate: 'ASC' },
          // take: 1,
        }),
      ]);

      if (!periodTracker || !periodRecords.length) {
        return {
          years: [],
        };
      }

      // Get the last actual period record
      const lastPeriod = periodRecords[0]; // Get the earliest record instead of latest
      const lastPeriodStartDate = new Date(lastPeriod.startDate);
      const cycleLengthDays = periodTracker.cycleLengthDays;
      const periodLengthDays = differenceInDays(
        lastPeriod.endDate,
        lastPeriod.startDate,
      );

      console.log('[LAST-PERIOD-START-DATE]', lastPeriod);

      // Get the year of the last period start date
      const lastPeriodYear = lastPeriodStartDate.getFullYear();
      const years: PredictedYearTrackerInfo[] = [];

      // Generate monthly information from the beginning of last period start year to current year
      let todaysPhase: MenstrualPhase | null = null;
      for (let year = lastPeriodYear; year <= currentYear; year++) {
        const startMonth = year === lastPeriodYear ? 0 : 0; // Always start from January (month 0)
        const endMonth = 11; // Always end at December (month 11)
        const months: MonthlyPeriodInfo[] = [];

        for (
          let monthIndex = startMonth;
          monthIndex <= endMonth;
          monthIndex++
        ) {
          const monthStart = startOfMonth(new Date(year, monthIndex, 1));

          // Skip if month start is before last period start date
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
          let previousCycleDayCount = 0; // Track previous day's cycle count

          while (currentDate <= monthEnd) {
            // Skip days before last period start date
            if (isBefore(currentDate, lastPeriodStartDate)) {
              currentDate = addDays(currentDate, 1);
              continue;
            }

            // First determine if this is a period day (actual or predicted)
            // Check if current date falls within any actual period record
            const isWithinActualPeriod = periodRecords.some((record) => {
              const currentDateStr = currentDate.toISOString().split('T')[0];
              const recordStartStr = new Date(record.startDate)
                .toISOString()
                .split('T')[0];
              const recordEndStr = new Date(record.endDate)
                .toISOString()
                .split('T')[0];

              return (
                currentDateStr >= recordStartStr &&
                currentDateStr <= recordEndStr
              );
            });

            // Check if there's a period record that starts in this month
            const monthHasActualPeriod = periodRecords.some((record) => {
              const recordStart = new Date(record.startDate);
              return (
                recordStart.getMonth() === currentDate.getMonth() &&
                recordStart.getFullYear() === currentDate.getFullYear()
              );
            });

            // Find the most recent actual period that started at or before this date
            const mostRecentActualPeriod = periodRecords
              .filter((record) => {
                const recordStartStr = new Date(record.startDate)
                  .toISOString()
                  .split('T')[0];
                const currentDateStr = currentDate.toISOString().split('T')[0];
                return recordStartStr <= currentDateStr;
              })
              .sort((a, b) => {
                const dateA = new Date(a.startDate).getTime();
                const dateB = new Date(b.startDate).getTime();
                return dateB - dateA;
              })[0];

            const baselineStartDate = mostRecentActualPeriod
              ? new Date(mostRecentActualPeriod.startDate)
              : lastPeriodStartDate;

            // Calculate base cycle information for predictions
            const { cycleStartDate: predictedCycleStart } =
              calculateCycleDayCount(
                currentDate,
                baselineStartDate,
                cycleLengthDays,
              );
            const predictedPeriodStart = predictedCycleStart;
            const predictedPeriodEnd = addDays(
              predictedPeriodStart,
              periodLengthDays,
            );

            let isPredictedPeriodDay: boolean;
            if (isWithinActualPeriod) {
              // Always mark as period day if it falls within an actual record
              isPredictedPeriodDay = true;
            } else if (monthHasActualPeriod) {
              // For months with actual period records, don't predict additional periods
              isPredictedPeriodDay = false;
            } else {
              // For months without an actual period start, use predicted dates based on cycle
              isPredictedPeriodDay = isWithinInterval(currentDate, {
                start: predictedPeriodStart,
                end: predictedPeriodEnd,
              });
            }

            // Calculate cycle day
            let cycleDay: number;
            let cycleStartDate: Date;

            // Calculate days since the baseline period
            const currentDateStr = currentDate.toISOString().split('T')[0];
            const baselineStartStr = baselineStartDate
              .toISOString()
              .split('T')[0];

            const currentDateMidnight = new Date(
              currentDateStr + 'T00:00:00.000Z',
            );
            const baselineStartMidnight = new Date(
              baselineStartStr + 'T00:00:00.000Z',
            );

            const daysSinceBaseline = differenceInDays(
              currentDateMidnight,
              baselineStartMidnight,
            );

            // Check if this is the first day of an actual period
            const isFirstDayOfActualPeriod = periodRecords.some((record) => {
              const recordStartStr = new Date(record.startDate)
                .toISOString()
                .split('T')[0];
              return recordStartStr === currentDateStr;
            });

            if (isFirstDayOfActualPeriod) {
              // Always reset to day 1 for actual period starts
              cycleDay = 1;
              cycleStartDate = currentDate;
            } else if (isPredictedPeriodDay) {
              // This is a period day (actual or predicted)
              const actualPeriod = periodRecords.find((record) => {
                const recordStartStr = new Date(record.startDate)
                  .toISOString()
                  .split('T')[0];
                const recordEndStr = new Date(record.endDate)
                  .toISOString()
                  .split('T')[0];
                return (
                  currentDateStr >= recordStartStr &&
                  currentDateStr <= recordEndStr
                );
              });

              if (actualPeriod) {
                // Within an actual period, calculate day from its start
                const periodStart = new Date(actualPeriod.startDate);
                const periodStartStr = periodStart.toISOString().split('T')[0];
                const periodStartMidnight = new Date(
                  periodStartStr + 'T00:00:00.000Z',
                );
                cycleDay =
                  differenceInDays(currentDateMidnight, periodStartMidnight) +
                  1;
                cycleStartDate = periodStart;
              } else {
                // This is a predicted period day
                // Calculate which cycle we're in
                const cycleNumber = Math.floor(
                  daysSinceBaseline / cycleLengthDays,
                );
                const dayInCycle = daysSinceBaseline % cycleLengthDays;

                // If this is day 0 of a cycle and it's a period day, it's the start
                if (dayInCycle === 0) {
                  cycleDay = 1;
                  cycleStartDate = currentDate;
                } else {
                  cycleDay = dayInCycle + 1;
                  cycleStartDate = addDays(
                    baselineStartDate,
                    cycleNumber * cycleLengthDays,
                  );
                }
              }
            } else {
              // Not a period day - just continue counting from the baseline
              cycleDay = daysSinceBaseline + 1;

              // Find which cycle we're in
              const cycleNumber = Math.floor(
                daysSinceBaseline / cycleLengthDays,
              );
              cycleStartDate = addDays(
                baselineStartDate,
                cycleNumber * cycleLengthDays,
              );

              // Adjust cycle day to be within the current cycle
              const dayInCycle = daysSinceBaseline % cycleLengthDays;
              cycleDay = dayInCycle + 1;
            }

            // For each date, calculate period and ovulation based on its cycle
            const periodStartDate = cycleStartDate;
            const periodEndDate = addDays(periodStartDate, periodLengthDays);

            const follicularPhaseLength =
              calculateFollicularPhaseLength(cycleLengthDays);
            const ovulationDate = addDays(
              cycleStartDate,
              follicularPhaseLength,
            );
            const isPredictedOvulationDay = isSameDay(
              currentDate,
              ovulationDate,
            );

            const fertileWindowStart = addDays(ovulationDate, -3);
            const fertileWindowEnd = addDays(ovulationDate, 2);
            const isFertileWindow = isWithinInterval(currentDate, {
              start: fertileWindowStart,
              end: fertileWindowEnd,
            });

            // Determine menstrual phase for the current day
            let currentPhase: MenstrualPhase = MenstrualPhase.LUTEAL_PHASE;
            if (
              isWithinInterval(currentDate, {
                start: periodStartDate,
                end: periodEndDate,
              })
            ) {
              currentPhase = MenstrualPhase.MENSTRUAL_PHASE;
            } else if (
              isWithinInterval(currentDate, {
                start: addDays(periodEndDate, 1),
                end: addDays(fertileWindowStart, -1),
              })
            ) {
              currentPhase = MenstrualPhase.FOLLICULAR_PHASE;
            } else if (
              isWithinInterval(currentDate, {
                start: fertileWindowStart,
                end: fertileWindowEnd,
              })
            ) {
              currentPhase = MenstrualPhase.OVULATION_PHASE;
            } else {
              currentPhase = MenstrualPhase.LUTEAL_PHASE;
            }

            // Check if cycleDayCount is 1 but it's not a period day
            if (
              cycleDay === 1 &&
              !isPredictedPeriodDay &&
              previousCycleDayCount > 0
            ) {
              // This is likely an error, continue from previous count
              cycleDay = previousCycleDayCount + 1;

              // Recalculate cycle start date based on the corrected cycle day
              const daysSinceStart = cycleDay - 1;
              cycleStartDate = addDays(currentDate, -daysSinceStart);
            }

            // Generate insights with potentially updated cycle information
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
              isLoggedPeriodDay: periodRecords.some((record) => {
                // Use the date string directly for comparison to avoid timezone issues
                const currentDateStr = currentDate.toISOString().split('T')[0];
                const recordStartStr = new Date(record.startDate)
                  .toISOString()
                  .split('T')[0];
                const recordEndStr = new Date(record.endDate)
                  .toISOString()
                  .split('T')[0];

                return (
                  currentDateStr >= recordStartStr &&
                  currentDateStr <= recordEndStr
                );
              }),
              cycleDayCount: cycleDay > 0 ? cycleDay : 1,
              isToday: isSameDay(currentDate, new Date()),
              isPredictedPeriodDay,
              isFertileWindow,
              isPredictedOvulationDay,
              insights,
            });

            // Update previous cycle day count for next iteration
            previousCycleDayCount = cycleDay;
            // If this is today, remember phase to persist on account
            if (isSameDay(currentDate, new Date())) {
              todaysPhase = currentPhase;
            }
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

        // Only add year if it has months
        if (months.length > 0) {
          years.push({
            currentYear: year,
            months,
          });
        }
      }

      this.logger.log(
        `[FETCH-PREDICTED-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-SUCCESS]`,
      );

      // Persist today's predicted phase to Account.menstrualPhase if computed
      // if (todaysPhase) {
      //   await this.accountRepository.update(
      //     { id: secureUser.id },
      //     { menstrualPhase: todaysPhase },
      //   );
      // }

      return {
        years,
      };
    } catch (error) {
      this.logger.log(
        `[FETCH-PREDICTED-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}
