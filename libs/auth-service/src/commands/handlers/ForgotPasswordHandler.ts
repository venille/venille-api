import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ForgotPasswordCommand } from '../impl';
import { createHash, randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import authUtils from 'libs/common/src/security/auth.utils';
import { Account } from 'libs/common/src/models/account.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';
import { AuthEmailNotificationService } from '@app/notification-service/src/services/email/auth.email.notification.service';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  constructor(
    private readonly eventBus: EventBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly AuthEmailNotificationService: AuthEmailNotificationService,
  ) {}

  async execute(command: ForgotPasswordCommand) {
    try {
      this.logger.log(`[FORGOT-PASSWORD-HANDLER-PROCESSING]`);

      const { payload, origin } = command;

      const passwordResetToken = randomUUID();
      const passwordResetCode = authUtils.generateRandomPin();
      const passwordResetCodeExpiration = authUtils.generateFutureDate(
        1,
        'hours',
      );

      const account = await this.accountRepository.findOne({
        where: {
          email: payload.email,
        },
      });

      if (!account) {
        throw UserNotFoundException();
      }

      Object.assign(account, {
        passwordResetCode: passwordResetCode,
        passwordResetToken: passwordResetToken,
        passwordResetCodeExpires: passwordResetCodeExpiration,
      });

      await this.accountRepository.save(account);

      this.AuthEmailNotificationService.forgotPasswordNotification(account);

      this.logger.log(`[FORGOT-PASSWORD-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[FORGOT-PASSWORD-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
