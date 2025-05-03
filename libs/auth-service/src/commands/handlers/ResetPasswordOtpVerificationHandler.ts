import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { ForbiddenException, Inject } from '@nestjs/common';
import { ResetPasswordOTpVerificationCommand } from '../impl';
import { Account } from '@app/common/src/models/account.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from '@app/common/src/logger/logger.service';
import { ResetPasswordOTPVerificationResponsePayload } from 'libs/auth-service/src/interface';

@CommandHandler(ResetPasswordOTpVerificationCommand)
export class ResetPasswordOtpVerificationHandler
  implements
    ICommandHandler<
      ResetPasswordOTpVerificationCommand,
      ResetPasswordOTPVerificationResponsePayload
    >
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(command: ResetPasswordOTpVerificationCommand) {
    try {
      this.logger.log(`[RESET-PASSWORD-OTP-VERIFICATION-HANDLER-PROCESSING]`);

      const { payload, origin } = command;

      const account = await this.accountRepository.findOne({
        where: {
          email: payload.email,
          passwordResetCode: payload.otp,
          passwordResetCodeExpires: MoreThanOrEqual(new Date()),
        },
      });

      if (!account) {
        throw new ForbiddenException('OTP expired or account does not exist');
      }

      await this.accountRepository.save(account);

      this.logger.log(`[RESET-PASSWORD-OTP-VERIFICATION-HANDLER-SUCCESS]`);

      return {
        accountId: account.id.toString(),
        passwordResetToken: account.passwordResetToken,
      } as ResetPasswordOTPVerificationResponsePayload;
    } catch (error) {
      this.logger.log(
        `[RESET-PASSWORD-OTP-VERIFICATION-HANDLER-ERROR] :: ${error}`,
      );
      console.log(error);

      throw error;
    }
  }
}
