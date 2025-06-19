import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { addDays, format } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PeriodSymptomLog,
  PeriodTrackerRecord,
  PeriodTrackerDayInfo,
  PeriodTrackerWeekInfo,
  PeriodOvulationPrediction,
} from '@app/common/src/models/period.record.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FetchWeeklyPeriodHistoryQuery } from '../impl';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';
import { formatMonthTitle, isSameDay } from '@app/common/src/utils/date.utils';

@QueryHandler(FetchWeeklyPeriodHistoryQuery)
export class FetchWeeklyPeriodHistoryQueryHandler
  implements IQueryHandler<FetchWeeklyPeriodHistoryQuery, PeriodTrackerWeekInfo>
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
    query: FetchWeeklyPeriodHistoryQuery,
  ): Promise<PeriodTrackerWeekInfo> {
    try {
      const { secureUser, startDate } = query;

      this.logger.log(
        `[FETCH-WEEKLY-PERIOD-HISTORY-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      const today = new Date();

      const [tracker, periodData, ovulationPrediction] = await Promise.all([
        this.periodTrackerRepository.findOne({
          where: { account: { id: secureUser.id } },
        }),
        this.periodRecordRepository.find({
          where: { account: { id: secureUser.id } },
          order: { startDate: 'DESC' },
        }),
        this.ovulationPredictionRepository.findOne({
          where: { account: { id: secureUser.id } },
        }),
      ]);

      const ovulationDate = ovulationPrediction?.ovulationDate
        ? new Date(ovulationPrediction.ovulationDate)
        : null;

      const lastPeriod =
        periodData.find((p) => !p.isPredicted) || periodData[0];
      const baseDate = lastPeriod?.startDate
        ? new Date(lastPeriod.startDate)
        : tracker?.lastPeriodStartDate
          ? new Date(tracker.lastPeriodStartDate)
          : null;

      const cycleLengthDays = tracker?.cycleLengthDays || 28;
      const periodLengthDays = tracker?.periodLengthDays || 5;

      const weekDays: PeriodTrackerDayInfo[] = [];

      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(startDate, i);

        let isPredictedPeriodDay = false;
        let isPredictedOvulationDay = false;
        let periodDayCount = 0;
        let insights = 'Regular cycle day';

        if (baseDate) {
          const daysSinceBase =
            (currentDate.getTime() - baseDate.getTime()) /
            (1000 * 60 * 60 * 24);
          const cycleIndex = Math.floor(daysSinceBase / cycleLengthDays);
          const cycleStartDate = addDays(
            baseDate,
            cycleIndex * cycleLengthDays,
          );
          const periodStartDate = addDays(
            cycleStartDate,
            cycleLengthDays - periodLengthDays,
          );

          const ovulationEstimate = addDays(
            cycleStartDate,
            cycleLengthDays - 14,
          );

          isPredictedPeriodDay =
            currentDate >= periodStartDate &&
            currentDate < addDays(periodStartDate, periodLengthDays);

          isPredictedOvulationDay = isSameDay(
            currentDate,
            ovulationDate || ovulationEstimate,
          );

          if (isPredictedPeriodDay) {
            periodDayCount =
              Math.floor(
                (currentDate.getTime() - periodStartDate.getTime()) /
                  (1000 * 60 * 60 * 24),
              ) + 1;
            insights = `Predicted period day ${periodDayCount}`;
          } else if (isPredictedOvulationDay) {
            insights = 'Ovulation day - peak fertility';
          } else {
            const daysToOvulation = Math.ceil(
              (ovulationEstimate.getTime() - currentDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            if (daysToOvulation > 0 && daysToOvulation <= 7) {
              insights = `Ovulation in ${daysToOvulation} day(s)`;
            } else if (daysToOvulation < 0 && daysToOvulation >= -7) {
              insights = 'Post-ovulation phase';
            } else if (daysToOvulation <= -8) {
              insights = 'Late luteal phase - period approaching';
            }
          }
        }

        weekDays.push({
          date: currentDate,
          isToday: isSameDay(currentDate, today),
          periodDayCount,
          isPredictedPeriodDay,
          isPredictedOvulationDay,
          insights,
        });

        console.log('{CURRENT DATE}', currentDate);
      }

      console.log('{TODAY}', today);

      return {
        monthTitle: formatMonthTitle(startDate),
        days: weekDays,
      };
    } catch (error) {
      this.logger.log(
        `[FETCH-DASHBOARD-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}
