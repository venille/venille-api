import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchMenstrualPhasesQuery } from '../impl';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  MenstrualPhase,
  MenstrualPhaseInfo,
  MenstrualPhaseDescription,
} from '@app/common/src/models/menstrual.phase.model';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { FormatMenstrualPhaseInfo } from '@app/common/src/middlewares/models.formatter';

@QueryHandler(FetchMenstrualPhasesQuery)
export class FetchMenstrualPhasesQueryHandler
  implements IQueryHandler<FetchMenstrualPhasesQuery, MenstrualPhaseInfo[]>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(MenstrualPhase)
    private readonly menstrualPhaseRepository: Repository<MenstrualPhase>,
    @InjectRepository(MenstrualPhaseDescription)
    private readonly menstrualPhaseDescriptionRepository: Repository<MenstrualPhaseDescription>,
  ) {}

  async execute(
    query: FetchMenstrualPhasesQuery,
  ): Promise<MenstrualPhaseInfo[]> {
    try {
      this.logger.log(`[FETCH-MENSTRUAL-PHASES-QUERY-HANDLER-PROCESSING]`);

      const cacheKey = `menstrual_phases`;

      const cachedResult =
        await this.cacheManager.get<MenstrualPhaseInfo[]>(cacheKey);
      if (cachedResult) {
        this.logger.log(
          `[FETCH-MENSTRUAL-PHASES-QUERY-HANDLER-CACHE-HIT]: ${cacheKey}`,
        );
        // return cachedResult;
      }

      const menstrualPhases: MenstrualPhaseInfo[] = [];

      const phases = await this.menstrualPhaseRepository.find({
        order: {
          position: 'ASC',
        },
      });

      console.log('[PHASES] :: ', phases);

      await Promise.all(
        phases.map(async (phase) => {
          try {
            this.logger.log(
              `[FETCH-MENSTRUAL-PHASE-INFO-QUERY-HANDLER-PROCESSING]`,
            );
            const phaseDescriptions =
              await this.menstrualPhaseDescriptionRepository.find({
                where: {
                  menstrualPhase: {
                    id: phase.id,
                  },
                },
                order: {
                  position: 'ASC',
                },
              });

            menstrualPhases.push(
              FormatMenstrualPhaseInfo(phase, phaseDescriptions),
            );

            this.logger.log(
              `[FETCH-MENSTRUAL-PHASE-INFO-QUERY-HANDLER-SUCCESS]`,
            );
          } catch (error) {
            this.logger.error(
              `[FETCH-MENSTRUAL-PHASE-INFO-QUERY-HANDLER-ERROR]: ${error}`,
            );
          }
        }),
      );

      const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
      await this.cacheManager.set(cacheKey, menstrualPhases, CACHE_TTL_MS);

      this.logger.log(`[FETCH-MENSTRUAL-PHASES-QUERY-HANDLER-SUCCESS]`);

      return menstrualPhases;
    } catch (error) {
      this.logger.log(`[FETCH-MENSTRUAL-PHASES-QUERY-HANDLER-ERROR]: ${error}`);

      throw error;
    }
  }
}
