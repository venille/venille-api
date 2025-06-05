import { SecureUserPayload } from '@app/common/src/interface';

export class FetchPeriodTrackerHistoryQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}