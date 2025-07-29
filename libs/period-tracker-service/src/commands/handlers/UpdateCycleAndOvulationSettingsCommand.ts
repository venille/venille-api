import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCycleAndOvulationSettingsCommand } from '../impl';
import { AppLogger } from '@app/common/src/logger/logger.service';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';
import { ResourceNotFoundException } from 'libs/common/src/constants/exceptions';
import { CycleOvulationInfo, PeriodTracker } from '@app/common/src/models/period.tracker.model';

@CommandHandler(UpdateCycleAndOvulationSettingsCommand)
export class UpdateCycleAndOvulationSettingsCommandHandler
  implements ICommandHandler<UpdateCycleAndOvulationSettingsCommand, CycleOvulationInfo>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(PeriodTracker)
    private readonly periodTrackerRepository: Repository<PeriodTracker>,
  ) {}

  async execute(command: UpdateCycleAndOvulationSettingsCommand) {
    try {
      this.logger.log(
        `[UPDATE-CYCLE-AND-OVULATION-SETTINGS-COMMAND-HANDLER-PROCESSING]`,
      );

      const { payload, secureUser } = command;

      const periodTracker = await this.periodTrackerRepository.findOne({
        where: {
          account: {
            id: secureUser.id,
          },
        },
      });

      if (!periodTracker) {
        throw ResourceNotFoundException();
      }

      Object.assign(periodTracker, {
        cycleLengthDays: payload.cycleLength,
        periodLengthDays: payload.periodLength,
        lutealPhaseLengthDays: payload.lutealPhaseLength,
      });

      await this.periodTrackerRepository.save(periodTracker);



      this.logger.log(
        `[UPDATE-CYCLE-AND-OVULATION-SETTINGS-COMMAND-HANDLER-SUCCESS]`,
      );

      return modelsFormatter.FormatCycleAndOvulationInfo(periodTracker);
    } catch (error) {
      this.logger.log(
        `[UPDATE-CYCLE-AND-OVULATION-SETTINGS-COMMAND-HANDLER-ERROR] :: ${error}`,
      );

      throw error;
    }
  }
}
