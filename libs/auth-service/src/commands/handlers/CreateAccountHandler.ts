import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CreateAccountCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccountEvent } from '../../events/impl';
import { SignupResponsePayload } from '../../interface';
import { AuthService } from '../../services/auth.service';
import authUtils from 'libs/common/src/security/auth.utils';
import { Account } from 'libs/common/src/models/account.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { EmailAlreadyUsedException } from 'libs/common/src/constants/exceptions';
import { AuthEmailNotificationService } from 'libs/notification-service/src/services/email/auth.email.notification.service';

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler
  implements ICommandHandler<CreateAccountCommand, SignupResponsePayload>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly authService: AuthService,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly userRepository: Repository<Account>,
    private readonly authEmailNotificationService: AuthEmailNotificationService,
  ) {}

  async execute(command: CreateAccountCommand) {
    try {
      this.logger.log(`[CREATE-ACCOUNT-HANDLER-PROCESSING]`);

      const { payload, origin } = command;

      const hashPayload = Object.fromEntries(
        Object.entries(payload).filter(
          ([key]) =>
            ![
              'referralCode',
              'password',
              'firstName',
              'lastName',
              'phone',
            ].includes(key),
        ),
      );

      // console.log('[HASH-PAYLOAD] : ', hashPayload);

      const hash = createHash('sha256')
        .update(JSON.stringify(hashPayload))
        .digest('hex');

      const activationCode = authUtils.generateRandomPin();
      const activationCodeExpiration = authUtils.generateFutureDate(1, 'hours');

      const existingUser = await this.userRepository.findOne({
        where:  {
          email: payload.email,
        },
      });

      if (existingUser && existingUser.signupVerificationHash === '') {
        throw EmailAlreadyUsedException();
      }

      const existingHash = await this.userRepository.findOne({
        where: {
          signupVerificationHash: hash,
        },
      });

      if (existingHash) {
        const password = await authUtils.hashPassword(payload.password);

        const referralCode = await this.authService.generateReferralCode();

        Object.assign(existingHash, {
          ...existingHash,
          firstName: payload.firstName,
          lastName: payload.lastName,
          phoneNumber: payload.phone,
          email: payload.email,
          referralCode: referralCode,
          password,
          // state: payload.state,
          // city: payload.city,
          isProfileUpdated: true,
          signupVerificationHash: hash,
          activationCode: activationCode,
          activationCodeExpires: activationCodeExpiration,
        });

        await this.userRepository.save(existingHash);

        this.authEmailNotificationService.newAccountNotifications(existingHash);

        this.logger.log(`[CREATE-ACCOUNT-HANDLER-SUCCESS]`);

        return {
          signupVerificationHash: hash,
        } as SignupResponsePayload;
      } else {
        const password = await authUtils.hashPassword(payload.password);

        const referralCode = await this.authService.generateReferralCode();

        const newAccount = await this.userRepository.save({
          firstName: payload.firstName,
          lastName: payload.lastName,
          phoneNumber: payload.phone,
          email: payload.email,
          referralCode,
          password,
          // state: payload.state,
          // city: payload.city,
          isProfileUpdated: true,
          signupVerificationHash: hash,
          activationCode: activationCode,
          activationCodeExpires: activationCodeExpiration,
        });

        this.eventBus.publish(
          new CreateAccountEvent(origin, newAccount, payload),
        );

        this.logger.log(`[CREATE-ACCOUNT-HANDLER-SUCCESS]`);

        return {
          signupVerificationHash: newAccount.signupVerificationHash,
        } as SignupResponsePayload;
      }
    } catch (error) {
      this.logger.log(`[CREATE-ACCOUNT-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
