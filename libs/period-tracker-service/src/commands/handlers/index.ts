import { LogPeriodHistoryCommandHandler } from './LogPeriodHistoryCommandHandler';
import { LogPeriodSymptomsCommandHandler } from './LogPeriodSymptomsCommandHandler';
import { UpdateCycleAndOvulationSettingsCommandHandler } from './UpdateCycleAndOvulationSettingsCommand';


export const PeriodTrackerServiceCommandHandlers = [
  LogPeriodHistoryCommandHandler,
  LogPeriodSymptomsCommandHandler,
  UpdateCycleAndOvulationSettingsCommandHandler,
];
