import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MenstrualPhase,
  MenstrualPhaseInfo,
  MenstrualPhaseDescription,
} from '@app/common/src/models/menstrual.phase.model';
import { DashboardInfo } from '../../interface/schema';
import { differenceInDays, getDay, getYear } from 'date-fns';
import { getMonthName } from '@app/common/src/utils/date.utils';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { FetchDashboardInfoQuery, FetchMenstrualPhasesQuery } from '../impl';
import { PeriodTrackerRecord } from '@app/common/src/models/period.record.model';
import { calculateCycleDayCount } from '@app/common/src/calculator/period.calculator';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';

@QueryHandler(FetchDashboardInfoQuery)
export class FetchDashboardInfoQueryHandler
  implements IQueryHandler<FetchDashboardInfoQuery, DashboardInfo>
{
  constructor(
    private readonly queryBus: QueryBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(PeriodTracker)
    private readonly periodTrackerRepository: Repository<PeriodTracker>,
    @InjectRepository(PeriodTrackerRecord)
    private readonly periodRecordRepository: Repository<PeriodTrackerRecord>,
  ) {}

  async execute(query: FetchDashboardInfoQuery): Promise<DashboardInfo> {
    try {
      const { secureUser } = query;

      this.logger.log(`[FETCH-DASHBOARD-INFO-QUERY-HANDLER-PROCESSING]`);

      const periodTracker = await this.periodTrackerRepository.findOne({
        where: {
          account: {
            id: secureUser.id,
          },
        },
      });

      const periodRecord = await this.periodRecordRepository.findOne({
        where: {
          account: {
            id: secureUser.id,
          },
        },
        order: {
          createdAt: 'DESC',
        },
      });

      const menstrualPhases: MenstrualPhaseInfo[] = await this.queryBus.execute(
        new FetchMenstrualPhasesQuery(),
      );

      this.logger.log(`[FETCH-DASHBOARD-INFO-QUERY-HANDLER-SUCCESS]`);

      const endDate = new Date(periodRecord.endDate);
      const startDate = new Date(periodRecord.startDate);

      console.log('[PERIOD-RECORD]', startDate);
      console.log('[PERIOD-RECORD]', periodRecord.startDate);

      return {
        previousCycleInfo: {
          startDate: `Started ${startDate.getDate()} ${getMonthName(startDate)} ${getYear(startDate)}`,
          daysAgo: `${differenceInDays(new Date(), startDate)} days ago`,
          duration: `Period Length: ${differenceInDays(
            endDate,
            startDate,
          )} days`,
          durationStatus:
            differenceInDays(endDate, startDate) > 7 ? 'Abnormal' : 'Normal',
          cycleLength: `Cycle Length: ${periodTracker.cycleLengthDays} days`,
          cycleLengthStatus:
            periodTracker.cycleLengthDays > 32 ? 'Abnormal' : 'Normal',
        },
        menstrualPhases: menstrualPhases as MenstrualPhaseInfo[],
      };
    } catch (error) {
      this.logger.log(`[FETCH-DASHBOARD-INFO-QUERY-HANDLER-ERROR]: ${error}`);

      throw error;
    }
  }
}
