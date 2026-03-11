import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { LogPeriodHistoryCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '@app/common/src/models/account.model';
import { AppLogger } from '@app/common/src/logger/logger.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';
import { PeriodTrackerRecord } from '@app/common/src/models/period.record.model';
import { differenceInCalendarDays, isSameDay } from 'date-fns';

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

      const { payload, secureUser } = command;

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

      // Extract all desired records and sort by start date
      let desiredList: { startDate: Date; endDate: Date }[] = [];
      for (const yearInfo of payload.years) {
        for (const periodInfo of yearInfo.months) {
          desiredList.push({
            startDate: new Date(periodInfo.startDate),
            endDate: new Date(periodInfo.endDate),
          });
        }
      }

      desiredList.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      // Merge contiguous or overlapping periods (e.g., crossing month boundaries)
      const mergedDesiredList: { startDate: Date; endDate: Date }[] = [];
      for (const current of desiredList) {
        if (mergedDesiredList.length === 0) {
          mergedDesiredList.push(current);
          continue;
        }

        const last = mergedDesiredList[mergedDesiredList.length - 1];
        // If current period starts within 1 day after the last period ends, merge them
        const diff = differenceInCalendarDays(current.startDate, last.endDate);
        if (diff <= 1) {
          if (current.endDate.getTime() > last.endDate.getTime()) {
            last.endDate = current.endDate;
          }
        } else {
          mergedDesiredList.push(current);
        }
      }
      
      desiredList = mergedDesiredList;

      // Extract and sort existing records locally
      const existingList = periodRecords.sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

      // Reconcile globally: exact matches are kept, differences are updated,
      // extra desired are created, extra existing are deleted
      const matchedExisting = new Set<number>();
      const matchedDesired = new Set<number>();

      // First pass: keep exact matches (same start & end day)
      for (let i = 0; i < desiredList.length; i++) {
        for (let j = 0; j < existingList.length; j++) {
          if (matchedExisting.has(j)) continue;
          const e = existingList[j];
          const d = desiredList[i];
          const eStart = new Date(e.startDate);
          const eEnd = e.endDate ? new Date(e.endDate) : null;
          if (
            isSameDay(eStart, d.startDate) &&
            eEnd &&
            isSameDay(eEnd, d.endDate)
          ) {
            matchedExisting.add(j);
            matchedDesired.add(i);
            if (e.isPredicted) {
              e.isPredicted = false;
              await this.periodTrackerRecordRepository.save(e);
            }
            break;
          }
        }
      }

      const remainingDesired = desiredList.filter(
        (_, idx) => !matchedDesired.has(idx),
      );
      const remainingExisting = existingList.filter(
        (_, idx) => !matchedExisting.has(idx),
      );

      // Update existing in-place to match desired (by index order)
      const numToUpdate = Math.min(
        remainingDesired.length,
        remainingExisting.length,
      );
      for (let i = 0; i < numToUpdate; i++) {
        const e = remainingExisting[i];
        const d = remainingDesired[i];
        this.logger.log(
          `[UPDATING-RECORD] :: ${e.startDate}→${d.startDate} | ${e.endDate}→${d.endDate}`,
        );
        e.startDate = d.startDate;
        e.endDate = d.endDate;
        e.isPredicted = false;
        await this.periodTrackerRecordRepository.save(e);
      }

      // Create additional desired records
      for (let i = numToUpdate; i < remainingDesired.length; i++) {
        const d = remainingDesired[i];
        this.logger.log(
          `[CREATING-NEW-RECORD] :: ${d.startDate} - ${d.endDate}`,
        );
        const newRecord = this.periodTrackerRecordRepository.create({
          account: account,
          startDate: d.startDate, // this maps correctly to the entity prop
          endDate: d.endDate,     // mapped correctly
          isPredicted: false,
        });
        await this.periodTrackerRecordRepository.save(newRecord);
      }

      // Delete extra existing records not present in desired
      for (let i = numToUpdate; i < remainingExisting.length; i++) {
        const e = remainingExisting[i];
        this.logger.log(
          `[DELETING-EXTRA-RECORD] :: ${e.startDate} - ${e.endDate}`,
        );
        await this.periodTrackerRecordRepository.remove(e);
      }

      this.logger.log(`[LOG-PERIOD-HISTORY-COMMAND-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[LOG-PERIOD-HISTORY-COMMAND-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
