import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import {
  AlreadyExistsException,
  UserNotFoundException,
} from 'libs/common/src/constants/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterPeriodTrackerCommand } from '../impl';
import { Account } from 'libs/common/src/models/account.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';

@CommandHandler(RegisterPeriodTrackerCommand)
export class RegisterPeriodTrackerHandler
  implements ICommandHandler<RegisterPeriodTrackerCommand>
{
  constructor(
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
      });

      await this.periodTrackerRepository.save(periodTracker);

      this.logger.log(`[REGISTER-PERIOD-TRACKER-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[REGISTER-PERIOD-TRACKER-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
