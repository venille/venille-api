import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchDetailedAccountInfoQuery } from '../impl';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';
import { Account, AccountInfo } from '@app/common/src/models/account.model';

@QueryHandler(FetchDetailedAccountInfoQuery)
export class FetchDetailedAccountInfoQueryHandler
  implements IQueryHandler<FetchDetailedAccountInfoQuery, AccountInfo>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(query: FetchDetailedAccountInfoQuery) {
    try {
      const { secureUser } = query;

      this.logger.log('[FETCH-DETAILED-ACCOUNT-INFO-QUERY-PROCESSING]');

      const account = await this.accountRepository.findOneBy({
        id: secureUser.id,
      });

      if (!account) {
        throw new Error(`Account with id ${secureUser.id} not found`);
      }

      this.logger.log('[FETCH-DETAILED-ACCOUNT-INFO-QUERY-SUCCESS]');

      return modelsFormatter.FormatAccountInfo(account);
    } catch (error) {
      this.logger.log(`[FETCH-DETAILED-ACCOUNT-INFO-QUERY-ERROR] : ${error}`);

      throw error;
    }
  }
}
