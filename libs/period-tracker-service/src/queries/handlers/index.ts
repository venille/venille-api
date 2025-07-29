import { FetchCycleAndOvulationInfoQuery } from '../impl';
import { FetchDashboardInfoQueryHandler } from './FetchDashboardInfoQueryHandler';
import { FetchMenstrualPhasesQueryHandler } from './FetchMenstrualPhasesQueryHandler';
import { FetchCycleAndOvulationSettingsQueryHandler } from './FetchCycleAndOvulationSettingsQueryHandler';
import { FetchPredictedPeriodTrackerHistoryQueryHandler } from './FetchPredictedPeriodTrackerHistoryQueryHandler';

export const PeriodTrackerServiceQueryHandlers = [
  FetchDashboardInfoQueryHandler,
  FetchCycleAndOvulationInfoQuery,
  FetchMenstrualPhasesQueryHandler,
  FetchCycleAndOvulationSettingsQueryHandler,
  FetchPredictedPeriodTrackerHistoryQueryHandler,
];
