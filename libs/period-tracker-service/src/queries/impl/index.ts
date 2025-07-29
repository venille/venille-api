import { SecureUserPayload } from '@app/common/src/interface';

export class FetchMenstrualPhasesQuery {
  constructor() {}
}

export class FetchDashboardInfoQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}

export class FetchCycleAndOvulationInfoQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}

export class FetchPredictedPeriodTrackerHistoryQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}

