import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { FetchAvailableStatesQuery } from '../impl';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AvailableStateInfo } from '../../interface/schema';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { AddressHelperService } from '@app/helper-service/src/services/address.helper.service';

@QueryHandler(FetchAvailableStatesQuery)
export class FetchAvailableStatesQueryHandler
  implements IQueryHandler<FetchAvailableStatesQuery, AvailableStateInfo[]>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly addressHelperService: AddressHelperService,
  ) {}

  async execute(query: FetchAvailableStatesQuery) {
    try {
      const cacheKey = `available_states`;

      const cachedResult =
        await this.cacheManager.get<AvailableStateInfo[]>(cacheKey);
      if (cachedResult) {
        this.logger.log(
          `[FETCH-AVAILABLE-STATES-QUERY-HANDLER-CACHE-HIT]: ${cacheKey}`,
        );
        return cachedResult;
      }

      this.logger.log(
        `[FETCH-AVAILABLE-STATES-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      const states = await this.addressHelperService.getUniqueStates();

      const result = states.map((state) => ({
        state: state.stateName,
        stateId: state.stateId,
        lgas: state.lgas,
      }));

      const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
      await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);

      this.logger.log(`[FETCH-AVAILABLE-STATES-QUERY-HANDLER-SUCCESS]`);

      return result;
    } catch (error) {
      this.logger.log(`[FETCH-AVAILABLE-STATES-QUERY-HANDLER-ERROR]: ${error}`);

      throw error;
    }
  }
}
