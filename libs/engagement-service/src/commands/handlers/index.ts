import { CreateForumHandler } from './CreateForumHandler';
import { DeleteForumHandler } from './DeleteForumHandler';
import { TranslateTextHandler } from './TranslateTextHandler';
import { CreateForumCommentHandler } from './CreateForumCommentHandler';
import { DeleteForumCommentHandler } from './DeleteForumCommentHandler';
import { LikeUnlikeForumPostHandler } from './LikeUnlikeForumPostHandler';

export const EngagementServiceCommandHandlers = [
  CreateForumHandler,
  DeleteForumHandler,
  TranslateTextHandler,
  CreateForumCommentHandler,
  DeleteForumCommentHandler,
  LikeUnlikeForumPostHandler,
];
