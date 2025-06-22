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

@QueryHandler(FetchDashboardInfoQuery)
export class FetchDashboardInfoQueryHandler
  implements IQueryHandler<FetchDashboardInfoQuery, DashboardInfo>
{
  constructor(
    private readonly queryBus: QueryBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(PeriodTrackerRecord)
    private readonly periodRecordRepository: Repository<PeriodTrackerRecord>,
  ) {}

  async execute(query: FetchDashboardInfoQuery): Promise<DashboardInfo> {
    try {
      const { secureUser } = query;

      this.logger.log(`[FETCH-DASHBOARD-INFO-QUERY-HANDLER-PROCESSING]`);

      const periodRecords = await this.periodRecordRepository.find({
        where: {
          account: {
            id: secureUser.id,
          },
        },
        order: {
          createdAt: 'DESC',
        },
        take: 2,
      });

      const menstrualPhases: MenstrualPhaseInfo[] = await this.queryBus.execute(
        new FetchMenstrualPhasesQuery(),
      );

      this.logger.log(`[FETCH-DASHBOARD-INFO-QUERY-HANDLER-SUCCESS]`);

      const endDate = periodRecords[0].endDate;
      const startDate = periodRecords[0].startDate;
      const previousStartDate =
        periodRecords.length > 1 ? periodRecords[1].startDate : new Date();

      const { cycleLength } = calculateCycleDayCount(
        previousStartDate,
        startDate,
        differenceInDays(endDate, startDate),
      );

      return {
        previousCycleInfo: {
          startDate: `Started ${getDay(startDate)} ${getMonthName(startDate)} ${getYear(startDate)}`,
          daysAgo: `${differenceInDays(new Date(), previousStartDate)} days ago`,
          duration: `Period Length: ${differenceInDays(
            endDate,
            startDate,
          )} days`,
          durationStatus:
            differenceInDays(endDate, startDate) > 7 ? 'Abnormal' : 'Normal',
          cycleLength: `Cycle Length: 30 days`,
          cycleLengthStatus: 30 > 30 ? 'Abnormal' : 'Normal',
        },
        menstrualPhases: menstrualPhases as MenstrualPhaseInfo[],
      };
    } catch (error) {
      this.logger.log(`[FETCH-DASHBOARD-INFO-QUERY-HANDLER-ERROR]: ${error}`);

      throw error;
    }
  }
}
