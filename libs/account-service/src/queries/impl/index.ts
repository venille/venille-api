import { SecureUserPayload } from '@app/common/src/interface';

export class FetchExistingCommunityUsersQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}

export class FetchUserCommunityRecordsQuery {
  constructor(public readonly secureUser: SecureUserPayload) {}
}
