import { FetchOnboardingQuestionsQueryHandler } from './FetchOnboardingQuestionsQueryHandler';
import { FetchDetailedAccountInfoQueryHandler } from './FetchDetailedAccountInfoQueryHandler';
import { FetchMonthlySurveyHistoryQueryHandler } from './FetchMonthlySurveyHistoryQueryHandler';
import { FetchSanitaryPadOrderHistoryQueryHandler } from './FetchSanitaryPadOrderHistoryQueryHandler';

export const AccountServiceQueryHandlers = [
  FetchDetailedAccountInfoQueryHandler,
  FetchOnboardingQuestionsQueryHandler,
  FetchMonthlySurveyHistoryQueryHandler,
  FetchSanitaryPadOrderHistoryQueryHandler,
];
