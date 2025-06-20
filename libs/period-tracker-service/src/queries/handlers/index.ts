import { FetchPeriodLogHistoryQueryHandler } from './FetchPeriodLogHistoryQueryHandler';
import { FetchWeeklyPeriodHistoryQueryHandler } from './FetchWeeklyPeriodHistoryQueryHandler';
import { FetchPeriodTrackerHistoryQueryHandler } from './FetchPeriodTrackerHistoryQueryHandler';
import { FetchDashboardPeriodTrackerHistoryQueryHandler } from './FetchDashboardPeriodTrackerHistoryQueryHandler';

export const PeriodTrackerServiceQueryHandlers = [
  FetchPeriodLogHistoryQueryHandler,
  FetchWeeklyPeriodHistoryQueryHandler,
  FetchPeriodTrackerHistoryQueryHandler,
  FetchDashboardPeriodTrackerHistoryQueryHandler,
];
