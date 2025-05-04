import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAccountPasswordCommand } from '../impl';
import { Account } from 'libs/common/src/models/account.model';
import authUtils from 'libs/common/src/security/auth.utils';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';

@CommandHandler(UpdateAccountPasswordCommand)
export class UpdateAccountPasswordHandler
  implements ICommandHandler<UpdateAccountPasswordCommand>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(command: UpdateAccountPasswordCommand) {
    try {
      this.logger.log(`[UPDATE-ACCOUNT-PASSWORD-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw UserNotFoundException();
      }

      if (
        !authUtils.comparePassword(payload.currentPassword, account.password)
      ) {
        throw new UnauthorizedException('Incorrect password.');
      }

      const newPassword = await authUtils.hashPassword(payload.newPassword);

      Object.assign(account, {
        password: newPassword,
      });

      await this.accountRepository.save(account);

      this.logger.log(`[UPDATE-ACCOUNT-PASSWORD-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[UPDATE-ACCOUNT-PASSWORD-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
