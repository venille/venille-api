import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAccountLocationCommand } from '../impl';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { Account, AccountInfo } from 'libs/common/src/models/account.model';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';

@CommandHandler(UpdateAccountLocationCommand)
export class UpdateAccountLocationHandler
  implements ICommandHandler<UpdateAccountLocationCommand, AccountInfo>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(command: UpdateAccountLocationCommand) {
    try {
      this.logger.log(`[UPDATE-ACCOUNT-LOCATION-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw UserNotFoundException();
      }

      Object.assign(account, {
        location: payload.state,
        state: payload.state,
        city: payload.city,
      });

      await this.accountRepository.save(account);

      this.logger.log(`[UPDATE-ACCOUNT-LOCATION-HANDLER-SUCCESS]`);

      return modelsFormatter.FormatAccountInfo(account);
    } catch (error) {
      this.logger.log(`[UPDATE-ACCOUNT-LOCATION-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
