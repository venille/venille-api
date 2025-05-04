import {
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeleteAccountCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import authUtils from 'libs/common/src/security/auth.utils';
import { Account } from 'libs/common/src/models/account.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';
import { AuthEmailNotificationService } from '@app/notification-service/src/services/email/auth.email.notification.service';

@CommandHandler(DeleteAccountCommand)
export class DeleteAccountHandler
  implements ICommandHandler<DeleteAccountCommand>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(command: DeleteAccountCommand) {
    try {
      this.logger.log(`[DELETE-ACCOUNT-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw UserNotFoundException();
      }

      if (!authUtils.comparePassword(payload.password, account.password)) {
        throw new UnauthorizedException('Invalid password.');
      }

      await this.accountRepository.remove(account);

      this.logger.log(`[DELETE-ACCOUNT-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[DELETE-ACCOUNT-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
