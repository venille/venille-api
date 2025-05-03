import { Repository } from 'typeorm';
import { SignInCommand } from '../impl';
import { SignInEvent } from '../../events/impl';
import { InjectRepository } from '@nestjs/typeorm';
import { SigninResponsePayload } from '../../interface';
import { AuthService } from '../../services/auth.service';
import authUtils from 'libs/common/src/security/auth.utils';
import { Account } from 'libs/common/src/models/account.model';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { AccountStatus } from '@app/common/src/constants/enums';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';

@CommandHandler(SignInCommand)
export class SignInHandler
  implements ICommandHandler<SignInCommand, SigninResponsePayload>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly authService: AuthService,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(command: SignInCommand) {
    try {
      this.logger.log(`[ACCOUNT-LOGIN-HANDLER-PROCESSING]`);

      const { payload } = command;

      const account = await this.accountRepository.findOneBy({
        email: payload.email,
      });

      if (!account) {
        throw UserNotFoundException();
      }

      if (account.status === AccountStatus.PENDING) {
        throw new UnauthorizedException(
          'Account not activated. Please contact support to complete your verification.',
        );
      } else if (
        account.status === AccountStatus.DISABLED ||
        account.status === AccountStatus.INACTIVE ||
        account.status === AccountStatus.SHADOW_BANNED
      ) {
        throw new UnauthorizedException(
          'Account disabled. Please contact support.',
        );
      }

      if (authUtils.comparePassword(payload.password, account.password)) {
        this.eventBus.publish(new SignInEvent(account));

        this.logger.log(`[ACCOUNT-LOGIN-HANDLER-SUCCESS]`);

        return {
          token: await this.authService.generateUserJWT(account),
        } as SigninResponsePayload;
      } else {
        this.logger.log(`[ACCOUNT-LOGIN-HANDLER-SUCCESS]`);

        throw new UnauthorizedException(
          'Unable to log in. Please verify your email and password.',
        );
      }
    } catch (error) {
      this.logger.log(`[ACCOUNT-LOGIN-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
