import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PeriodLogInfo,
  PeriodTrackerRecord,
} from '@app/common/src/models/period.record.model';
import { FetchPeriodLogHistoryQuery } from '../impl';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

@QueryHandler(FetchPeriodLogHistoryQuery)
export class FetchPeriodLogHistoryQueryHandler
  implements IQueryHandler<FetchPeriodLogHistoryQuery, PeriodLogInfo[]>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(PeriodTrackerRecord)
    private readonly periodRecordRepository: Repository<PeriodTrackerRecord>,
  ) {}

  async execute(query: FetchPeriodLogHistoryQuery): Promise<PeriodLogInfo[]> {
    try {
      const { secureUser } = query;

      this.logger.log(
        `[FETCH-PERIOD-LOG-HISTORY-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      // Get current year start and end dates
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31);

      const periodLogHistory = await this.periodRecordRepository.find({
        where: {
          account: { id: secureUser.id },
          startDate: MoreThanOrEqual(yearStart),
          endDate: LessThanOrEqual(yearEnd),
        },
        order: { startDate: 'ASC' },
      });

      this.logger.log(`[FETCH-PERIOD-LOG-HISTORY-QUERY-HANDLER-SUCCESS]`);

      return periodLogHistory.map((log) => ({
        startDate: log.startDate,
        endDate: log.endDate,
        isPredicted: log.isPredicted,
      }));
    } catch (error) {
      this.logger.log(
        `[FETCH-PERIOD-LOG-HISTORY-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}
