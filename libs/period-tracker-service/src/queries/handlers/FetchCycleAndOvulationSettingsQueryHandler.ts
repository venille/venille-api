import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PeriodTracker,
  CycleOvulationInfo,
} from '@app/common/src/models/period.tracker.model';
import { FetchCycleAndOvulationInfoQuery } from '../impl';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';
import { ResourceNotFoundException } from '@app/common/src/constants/exceptions';

@QueryHandler(FetchCycleAndOvulationInfoQuery)
export class FetchCycleAndOvulationSettingsQueryHandler
  implements IQueryHandler<FetchCycleAndOvulationInfoQuery, CycleOvulationInfo>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(PeriodTracker)
    private readonly periodTrackerRepository: Repository<PeriodTracker>,
  ) {}

  async execute(
    query: FetchCycleAndOvulationInfoQuery,
  ): Promise<CycleOvulationInfo> {
    try {
      const { secureUser } = query;

      this.logger.log(`[FETCH-CYCLE-AND-OVULATION-QUERY-HANDLER-PROCESSING]`);

      const periodTracker = await this.periodTrackerRepository.findOne({
        where: {
          account: {
            id: secureUser.id,
          },
        },
      });

      if (!periodTracker) {
        throw ResourceNotFoundException();
      }

      return modelsFormatter.FormatCycleAndOvulationInfo(periodTracker);
    } catch (error) {
      this.logger.log(
        `[FETCH-CYCLE-AND-OVULATION-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}

