import { CreateForumCommentDto, CreateForumDto } from '../../interface';
import { SecureUserPayload } from '@app/common/src/interface';

export class CreateForumCommand {
  constructor(
    public readonly payload: CreateForumDto,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class DeleteForumCommand {
  constructor(
    public readonly forumId: number,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class CreateForumCommentCommand {
  constructor(
    public readonly forumId: number,
    public readonly payload: CreateForumCommentDto,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class DeleteForumCommentCommand {
  constructor(
    public readonly commentId: number,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class LikeUnlikeForumPostCommand {
  constructor(
    public readonly forumId: number,
    public readonly secureUser: SecureUserPayload,
  ) {}
}