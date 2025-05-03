import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CreateAccountEvent } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../../services/auth.service';
import { Account } from '@app/common/src/models/account.model';
import { Referral } from '@app/common/src/models/referral.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Notification } from '@app/common/src/models/notification.model';
import { AuthEmailNotificationService } from '@app/notification-service/src/services/email/auth.email.notification.service';

@EventsHandler(CreateAccountEvent)
export class CreateAccountEventHandler
  implements IEventHandler<CreateAccountEvent>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    private readonly authService: AuthService,
    @InjectRepository(Account)
    private readonly userRepository: Repository<Account>,
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly authEmailNotificationService: AuthEmailNotificationService,
  ) {}

  async handle(event: CreateAccountEvent) {
    try {
      this.logger.log(
        `[CREATE-ACCOUNT-EVENT-HANDLER-PROCESSING]: ${JSON.stringify(event)}`,
      );

      const { account, payload } = event;

      const newUser = await this.userRepository.findOne({
        where: {
          id: account.id,
        },
      });

      if (payload?.referralCode?.length > 0) {
        const referringUser = await this.userRepository.findOneBy({
          referralCode: payload?.referralCode,
        });

        await this.referralRepository.save({
          user: referringUser,
          referredUser: newUser,
        });
      }

      await this.notificationRepository.save({
        title: '👋 Welcome to Venille',
        message: `We’re thrilled to have you on board. Whether you’re buying or selling, Venille is here to support your livestock/animals needs. Explore now and see what’s waiting for you!`,
        user: newUser,
      });

      this.authEmailNotificationService.newAccountNotifications(account);

      this.logger.log(`[CREATE-ACCOUNT-EVENT-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[CREATE-ACCOUNT-EVENT-HANDLER]: ${error}`);

      throw error;
    }
  }
}
