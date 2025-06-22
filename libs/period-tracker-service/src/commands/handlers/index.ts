import { LogPeriodHistoryCommandHandler } from './LogPeriodHistoryCommand';
import { LogPeriodSymptomsCommandHandler } from './LogPeriodSymptomsCommand';

export const PeriodTrackerServiceCommandHandlers = [
  LogPeriodHistoryCommandHandler,
  LogPeriodSymptomsCommandHandler,
];
