import { FetchOnboardingQuestionsQueryHandler } from './FetchOnboardingQuestionsQueryHandler';
import { FetchMonthlySurveyHistoryQueryHandler } from './FetchMonthlySurveyHistoryQueryHandler';
import { FetchSanitaryPadOrderHistoryQueryHandler } from './FetchSanitaryPadOrderHistoryQueryHandler';

export const AccountServiceQueryHandlers = [
  FetchOnboardingQuestionsQueryHandler,
  FetchMonthlySurveyHistoryQueryHandler,
  FetchSanitaryPadOrderHistoryQueryHandler,
];
