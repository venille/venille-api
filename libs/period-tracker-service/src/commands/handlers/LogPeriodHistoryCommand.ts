import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { LogPeriodHistoryCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '@app/common/src/models/account.model';
import { AppLogger } from '@app/common/src/logger/logger.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';
import { PeriodTrackerRecord } from '@app/common/src/models/period.record.model';
import { startOfMonth, isSameMonth } from 'date-fns';

@CommandHandler(LogPeriodHistoryCommand)
export class LogPeriodHistoryCommandHandler
  implements ICommandHandler<LogPeriodHistoryCommand>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(PeriodTrackerRecord)
    private readonly periodTrackerRecordRepository: Repository<PeriodTrackerRecord>,
  ) {}

  async execute(command: LogPeriodHistoryCommand) {
    try {
      this.logger.log(`[LOG-PERIOD-HISTORY-COMMAND-HANDLER-PROCESSING]`);

      const { periodHistory, secureUser } = command;

      const account = await this.accountRepository.findOneBy({
        id: secureUser.id,
      });

      if (!account) {
        throw UserNotFoundException();
      }

      const periodRecords = await this.periodTrackerRecordRepository.find({
        where: { account: { id: secureUser.id } },
        order: { startDate: 'ASC' },
      });

      // Process each year in the period history
      for (const yearInfo of periodHistory.years) {
        for (const monthInfo of yearInfo.months) {
          const historyStartDate = new Date(monthInfo.startDate);
          const historyEndDate = new Date(monthInfo.endDate);

          // Find existing record in the same month and year
          const existingRecord = periodRecords.find((record) => {
            const recordStartDate = new Date(record.startDate);
            return (
              recordStartDate.getMonth() === historyStartDate.getMonth() &&
              recordStartDate.getFullYear() === historyStartDate.getFullYear()
            );
          });

          if (existingRecord) {
            // Update existing record
            this.logger.log(
              `[UPDATING-EXISTING-RECORD] :: Month: ${historyStartDate}`,
            );

            existingRecord.startDate = historyStartDate;
            existingRecord.endDate = historyEndDate;
            existingRecord.isPredicted = false; // Mark as actual data

            await this.periodTrackerRecordRepository.save(existingRecord);
          } else {
            // Create new record
            this.logger.log(
              `[CREATING-NEW-RECORD] :: Month: ${historyStartDate}`,
            );

            const newRecord = this.periodTrackerRecordRepository.create({
              account: account,
              startDate: historyStartDate,
              endDate: historyEndDate,
              isPredicted: false, // Mark as actual data
            });

            await this.periodTrackerRecordRepository.save(newRecord);
          }
        }
      }

      this.logger.log(`[LOG-PERIOD-HISTORY-COMMAND-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[LOG-PERIOD-HISTORY-COMMAND-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
