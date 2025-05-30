import { SecureUserPayload } from '@app/common/src/interface';

export class FetchCourseFeedQuery {
  constructor(
    public readonly page: number,
    public readonly pageSize: number,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class FetchForumFeedQuery {
  constructor(
    public readonly page: number,
    public readonly pageSize: number,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class FetchUserForumFeedQuery {
  constructor(
    public readonly page: number,
    public readonly pageSize: number,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class FetchForumCommentsQuery {
  constructor(
    public readonly forumId: number,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly secureUser: SecureUserPayload,
  ) {}
}
