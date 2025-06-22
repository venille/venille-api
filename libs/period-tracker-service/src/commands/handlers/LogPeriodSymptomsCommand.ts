import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { LogPeriodSymptomsCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Account } from '@app/common/src/models/account.model';
import { AppLogger } from '@app/common/src/logger/logger.service';
import { LogPeriodSymptomEnum } from '@app/common/src/constants/enums';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';
import { PeriodSymptomLog } from '@app/common/src/models/period.record.model';

@CommandHandler(LogPeriodSymptomsCommand)
export class LogPeriodSymptomsCommandHandler
  implements ICommandHandler<LogPeriodSymptomsCommand>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(PeriodSymptomLog)
    private readonly periodSymptomLogRepository: Repository<PeriodSymptomLog>,
  ) {}

  async execute(command: LogPeriodSymptomsCommand) {
    try {
      this.logger.log(`[LOG-PERIOD-SYMPTOMS-COMMAND-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOneBy({
        id: secureUser.id,
      });

      if (!account) {
        throw UserNotFoundException();
      }

      await Promise.all(
        payload.symptoms.map(async (symptom) => {
          try {
            this.logger.log(`[LOG-PERIOD-SYMPTOMS-MANAGER-PROCESSING]`);

            const periodSymptomLog = this.periodSymptomLogRepository.create({
              account: account,
              date: new Date(payload.date),
              symptomType: symptom.symptomType as LogPeriodSymptomEnum,
              symptoms: symptom.symptoms,
            });

            await this.periodSymptomLogRepository.save(periodSymptomLog);

            this.logger.log(`[LOG-PERIOD-SYMPTOMS-MANAGER-SUCCESS]`);
          } catch (error) {
            this.logger.log(`[LOG-PERIOD-SYMPTOMS-MANAGER-ERROR] :: ${error}`);
          }
        }),
      );

      this.logger.log(`[LOG-PERIOD-SYMPTOMS-COMMAND-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(
        `[LOG-PERIOD-SYMPTOMS-COMMAND-HANDLER-ERROR] :: ${error}`,
      );

      throw error;
    }
  }
}
