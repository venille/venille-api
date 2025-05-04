import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAccountPhoneCommand } from '../impl';
import authUtils from 'libs/common/src/security/auth.utils';
import { Account, AccountInfo } from 'libs/common/src/models/account.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import {
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import modelsFormatter from 'libs/common/src/middlewares/models.formatter';

@CommandHandler(UpdateAccountPhoneCommand)
export class UpdateAccountPhoneHandler
  implements ICommandHandler<UpdateAccountPhoneCommand, AccountInfo>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(command: UpdateAccountPhoneCommand) {
    try {
      this.logger.log(`[UPDATE-ACCOUNT-PHONE-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!authUtils.comparePassword(payload.password, account.password)) {
        throw new UnauthorizedException('Invalid password.');
      }

      Object.assign(account, {
        phoneNumber: payload.newPhone,
      });

      await this.accountRepository.save(account);

      this.logger.log(`[UPDATE-ACCOUNT-PHONE-HANDLER-SUCCESS]`);

      return modelsFormatter.FormatAccountInfo(account);
    } catch (error) {
      this.logger.log(`[UPDATE-ACCOUNT-PHONE-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
