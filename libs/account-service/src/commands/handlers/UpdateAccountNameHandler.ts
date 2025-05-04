import {
  Inject,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAccountNameCommand } from '../impl';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { Account, AccountInfo } from 'libs/common/src/models/account.model';
import modelsFormatter from 'libs/common/src/middlewares/models.formatter';

@CommandHandler(UpdateAccountNameCommand)
export class UpdateAccountNameHandler
  implements ICommandHandler<UpdateAccountNameCommand, AccountInfo>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(command: UpdateAccountNameCommand) {
    try {
      this.logger.log(`[UPDATE-ACCOUNT-NAME-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw new UnauthorizedException('Account not found.');
      }

      Object.assign(account, {
        firstName: payload.firstName,
        lastName: payload.lastName,
      });

      await this.accountRepository.save(account);

      this.logger.log(`[UPDATE-ACCOUNT-NAME-HANDLER-SUCCESS]`);

      return modelsFormatter.FormatAccountInfo(account);
    } catch (error) {
      this.logger.log(`[UPDATE-ACCOUNT-NAME-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
