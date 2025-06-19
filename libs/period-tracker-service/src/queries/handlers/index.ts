import { FetchWeeklyPeriodHistoryQueryHandler } from './FetchWeeklyPeriodHistoryQueryHandler';
import { FetchPeriodTrackerHistoryQueryHandler } from './FetchPeriodTrackerHistoryQueryHandler';
import { FetchDashboardPeriodTrackerHistoryQueryHandler } from './FetchDashboardPeriodTrackerHistoryQueryHandler';

export const PeriodTrackerServiceQueryHandlers = [
  FetchWeeklyPeriodHistoryQueryHandler,
  FetchPeriodTrackerHistoryQueryHandler,
  FetchDashboardPeriodTrackerHistoryQueryHandler,
];
