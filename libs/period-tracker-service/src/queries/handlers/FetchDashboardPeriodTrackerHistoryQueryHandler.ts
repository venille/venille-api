import {
  FetchWeeklyPeriodHistoryQuery,
  FetchDashboardPeriodTrackerHistoryQuery,
} from '../impl';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { getWeekStartDates } from '@app/common/src/utils/date.utils';

import { DashboardTrackerInfo } from '@app/common/src/models/period.record.model';
@QueryHandler(FetchDashboardPeriodTrackerHistoryQuery)
export class FetchDashboardPeriodTrackerHistoryQueryHandler
  implements
    IQueryHandler<FetchDashboardPeriodTrackerHistoryQuery, DashboardTrackerInfo>
{
  constructor(
    private readonly queryBus: QueryBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(
    query: FetchDashboardPeriodTrackerHistoryQuery,
  ): Promise<DashboardTrackerInfo> {
    try {
      const { secureUser } = query;

      this.logger.log(
        `[FETCH-DASHBOARD-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      const { previousWeek, currentWeek, nextWeek } = getWeekStartDates();

      console.table({ previousWeek, currentWeek, nextWeek });

      const [previousWeekData, currentWeekData, nextWeekData] =
        await Promise.all([
          this.queryBus.execute(
            new FetchWeeklyPeriodHistoryQuery(previousWeek, secureUser),
          ),
          this.queryBus.execute(
            new FetchWeeklyPeriodHistoryQuery(currentWeek, secureUser),
          ),
          this.queryBus.execute(
            new FetchWeeklyPeriodHistoryQuery(nextWeek, secureUser),
          ),
        ]);

      this.logger.log(
        `[FETCH-DASHBOARD-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-SUCCESS]`,
      );

      return {
        nextWeek: nextWeekData,
        currentWeek: currentWeekData,
        previousWeek: previousWeekData,
      };
    } catch (error) {
      this.logger.log(
        `[FETCH-DASHBOARD-PERIOD-TRACKER-HISTORY-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}
