import { SecureUserPayload } from '@app/common/src/interface';

export class FetchExistingCommunityUsersQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}

export class FetchUserCommunityRecordsQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}

export class FetchOnboardingQuestionsQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}

export class FetchMonthlySurveyHistoryQuery {
  constructor(
    public readonly page: number,
    public readonly pageSize: number,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class FetchSanitaryPadOrderHistoryQuery {
  constructor(
    public readonly page: number,
    public readonly pageSize: number,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class FetchDetailedAccountInfoQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}