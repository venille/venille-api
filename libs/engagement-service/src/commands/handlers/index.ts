import { CreateForumHandler } from './CreateForumHandler';
import { DeleteForumHandler } from './DeleteForumHandler';
import { CreateForumCommentHandler } from './CreateForumCommentHandler';
import { DeleteForumCommentHandler } from './DeleteForumCommentHandler';

export const EngagementServiceCommandHandlers = [
  CreateForumHandler,
  DeleteForumHandler,
  CreateForumCommentHandler,
  DeleteForumCommentHandler,
];
