import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import {
  AlreadyExistsException,
  UserNotFoundException,
} from 'libs/common/src/constants/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterPeriodTrackerCommand } from '../impl';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { Account, AccountInfo } from 'libs/common/src/models/account.model';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';
import { RegisterPeriodTrackerEvent } from '../../events/impl';

@CommandHandler(RegisterPeriodTrackerCommand)
export class RegisterPeriodTrackerHandler
  implements ICommandHandler<RegisterPeriodTrackerCommand, AccountInfo>
{
  constructor(
    private readonly eventBus: EventBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(PeriodTracker)
    private readonly periodTrackerRepository: Repository<PeriodTracker>,
  ) {}

  async execute(command: RegisterPeriodTrackerCommand) {
    try {
      this.logger.log(`[REGISTER-PERIOD-TRACKER-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw UserNotFoundException();
      }

      const existingPeriodTracker = await this.periodTrackerRepository.findOne({
        where: {
          account: account,
        },
      });

      if (existingPeriodTracker) {
        throw AlreadyExistsException(
          'Period tracker already exists for this user.',
        );
      }

      const periodTracker = await this.periodTrackerRepository.create({
        ...payload,
        account: account,
        lastPeriodStartDate: new Date(payload.lastPeriodStartDate),
      });

      await this.periodTrackerRepository.save(periodTracker);

      Object.assign(account, {
        isOnboardingUploaded: true,
      });

      await this.accountRepository.save(account);

      this.eventBus.publish(
        new RegisterPeriodTrackerEvent(account, periodTracker),
      );

      this.logger.log(`[REGISTER-PERIOD-TRACKER-HANDLER-SUCCESS]`);

      return modelsFormatter.FormatAccountInfo(account);
    } catch (error) {
      this.logger.log(`[REGISTER-PERIOD-TRACKER-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
