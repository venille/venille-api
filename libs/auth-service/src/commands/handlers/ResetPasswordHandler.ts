import { Repository } from 'typeorm';
import { ResetPasswordCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import authUtils from '@app/common/src/security/auth.utils';
import { ForbiddenException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Account } from '@app/common/src/models/account.model';
import { AppLogger } from '@app/common/src/logger/logger.service';
import { AuthEmailNotificationService } from '@app/notification-service/src/services/email/auth.email.notification.service';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly AuthEmailNotificationService: AuthEmailNotificationService,
  ) {}

  async execute(command: ResetPasswordCommand) {
    try {
      this.logger.log(`[RESET-PASSWORD-HANDLER-PROCESSING]`);

      const { payload, origin } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: parseInt(payload.accountId),
          passwordResetToken: payload.passwordResetToken,
        },
      });

      if (!account) {
        throw new ForbiddenException(
          'Reset token expired or account does not exist',
        );
      }

      Object.assign(account, {
        passwordResetCode: null,
        passwordResetToken: null,
        passwordResetCodeExpires: null,
        password: await authUtils.hashPassword(payload.newPassword),
      });

      await this.accountRepository.save(account);

      this.AuthEmailNotificationService.resetPasswordNotification(account);

      this.logger.log(`[RESET-PASSWORD-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[RESET-PASSWORD-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
