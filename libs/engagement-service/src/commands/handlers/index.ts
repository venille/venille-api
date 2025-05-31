import { CreateForumHandler } from './CreateForumHandler';
import { DeleteForumHandler } from './DeleteForumHandler';
import { CreateForumCommentHandler } from './CreateForumCommentHandler';
import { DeleteForumCommentHandler } from './DeleteForumCommentHandler';
import { LikeUnlikeForumPostHandler } from './LikeUnlikeForumPostHandler';

export const EngagementServiceCommandHandlers = [
  CreateForumHandler,
  DeleteForumHandler,
  CreateForumCommentHandler,
  DeleteForumCommentHandler,
  LikeUnlikeForumPostHandler,
];
