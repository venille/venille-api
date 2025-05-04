import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAccountFCMTokenCommand } from '../impl';
import { Account } from 'libs/common/src/models/account.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';

@CommandHandler(UpdateAccountFCMTokenCommand)
export class UpdateAccountFCMTokenHandler
  implements ICommandHandler<UpdateAccountFCMTokenCommand>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(command: UpdateAccountFCMTokenCommand) {
    try {
      this.logger.log(`[UPDATE-ACCOUNT-FCM-TOKEN-HANDLER-PROCESSING]`);

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
        fcmToken: payload.fcmToken,
      });

      await this.accountRepository.save(account);

      this.logger.log(`[UPDATE-ACCOUNT-FCM-TOKEN-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[UPDATE-ACCOUNT-FCM-TOKEN-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
