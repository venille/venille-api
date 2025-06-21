import { SecureUserPayload } from '@app/common/src/interface';

export class FetchPredictedPeriodTrackerHistoryQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}
