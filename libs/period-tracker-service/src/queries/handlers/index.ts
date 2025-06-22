import { FetchDashboardInfoQueryHandler } from './FetchDashboardInfoQueryHandler';
import { FetchMenstrualPhasesQueryHandler } from './FetchMenstrualPhasesQueryHandler';
import { FetchPredictedPeriodTrackerHistoryQueryHandler } from './FetchPredictedPeriodTrackerHistoryQueryHandler';

export const PeriodTrackerServiceQueryHandlers = [
  FetchDashboardInfoQueryHandler,
  FetchMenstrualPhasesQueryHandler,
  FetchPredictedPeriodTrackerHistoryQueryHandler,
];
