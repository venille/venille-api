import { SecureUserPayload } from '@app/common/src/interface';

export class FetchPeriodTrackerHistoryQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}

export class FetchDashboardPeriodTrackerHistoryQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}

export class FetchWeeklyPeriodHistoryQuery {
  constructor(
    public readonly startDate: Date,
    public readonly secureUser: SecureUserPayload,
  ) {}
}