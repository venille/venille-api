import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PeriodSymptomLog,
  PeriodTrackerRecord,
  PeriodOvulationPrediction,
} from '@app/common/src/models/period.record.model';
import { RegisterPeriodTrackerEvent } from '../impl';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';

@EventsHandler(RegisterPeriodTrackerEvent)
export class RegisterPeriodTrackerEventHandler
  implements IEventHandler<RegisterPeriodTrackerEvent>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(PeriodSymptomLog)
    private readonly symptomLogRepository: Repository<PeriodSymptomLog>,
    @InjectRepository(PeriodTrackerRecord)
    private readonly periodRecordRepository: Repository<PeriodTrackerRecord>,
    @InjectRepository(PeriodOvulationPrediction)
    private readonly ovulationPredictionRepository: Repository<PeriodOvulationPrediction>,
  ) {}

  async handle(event: RegisterPeriodTrackerEvent) {
    try {
      this.logger.log(
        `[REGISTER-PERIOD-TRACKER-EVENT-HANDLER-PROCESSING]: ${JSON.stringify(event)}`,
      );

      const { account, periodTracker } = event;

      const periodRecord = this.periodRecordRepository.create({
        account: account,
        isPredicted: true,
        startDate: periodTracker.lastPeriodStartDate,
        endDate: new Date(
          periodTracker.lastPeriodStartDate.getTime() +
            periodTracker.cycleLengthDays * 24 * 60 * 60 * 1000,
        ),
      });

      const ovulationPrediction = this.ovulationPredictionRepository.create({
        account: account,
        ovulationDate: new Date(
          periodTracker.lastPeriodStartDate.getTime() +
            (periodTracker.cycleLengthDays - 14) * 24 * 60 * 60 * 1000,
        ),
      });

      const symptomLog = this.symptomLogRepository.create({
        account: account,
        symptoms: periodTracker.periodSymptoms,
      });

      await this.symptomLogRepository.save(symptomLog);
      await this.periodRecordRepository.save(periodRecord);
      await this.ovulationPredictionRepository.save(ovulationPrediction);

      this.logger.log(`[REGISTER-PERIOD-TRACKER-EVENT-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[REGISTER-PERIOD-TRACKER-EVENT-HANDLER]: ${error}`);

      throw error;
    }
  }
}
