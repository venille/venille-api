import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterMonthlySurveyCommand } from '../impl';
import { ConflictException, Inject } from '@nestjs/common';
import { Account } from 'libs/common/src/models/account.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import {
  MonthlySurvey,
  MonthlySurveyInfo,
} from '@app/common/src/models/monthly.survey.model';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';
import { FormatMonthlySurveyInfo } from '@app/common/src/middlewares/models.formatter';

@CommandHandler(RegisterMonthlySurveyCommand)
export class RegisterMonthlySurveyHandler
  implements ICommandHandler<RegisterMonthlySurveyCommand, MonthlySurveyInfo>
{
  constructor(
    public readonly eventBus: EventBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(MonthlySurvey)
    private readonly monthlySurveyRepository: Repository<MonthlySurvey>,
  ) {}

  getCurrentMonthRange(): [Date, Date] {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return [start, end];
  }

  async execute(command: RegisterMonthlySurveyCommand) {
    try {
      this.logger.log(`[REGISTER-MONTHLY-SURVEY-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw UserNotFoundException();
      }

      const [start, end] = this.getCurrentMonthRange();

      const existingSurvey = await this.monthlySurveyRepository.findOne({
        where: {
          account: {
            id: secureUser.id,
          },
          createdAt: Between(start, end),
        },
      });

      if (existingSurvey) {
        throw new ConflictException(
          'Survey already logged for the current month.',
        );
      }

      const survey = this.monthlySurveyRepository.create({
        account,
        hasAccessToPad: payload.hasAccessToPad,
        challengesFaced: payload.challengesFaced,
        daysManagingPeriod: payload.daysManagingMenstruation,
      });

      await this.monthlySurveyRepository.save(survey);

      this.logger.log(`[REGISTER-MONTHLY-SURVEY-HANDLER-SUCCESS]`);

      return FormatMonthlySurveyInfo(survey);
    } catch (error) {
      this.logger.log(`[REGISTER-MONTHLY-SURVEY-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
