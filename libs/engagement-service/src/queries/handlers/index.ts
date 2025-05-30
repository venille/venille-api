import { FetchForumFeedQueryHandler } from './FetchForumFeedQueryHandler';
import { FetchForumCommentsQueryHandler } from './FetchForumCommentsQueryHandler';
import { FetchUserForumFeedQueryHandler } from './FetchUserForumFeedQueryHandler';

export const EngagementServiceQueryHandlers = [
  FetchForumFeedQueryHandler,
  FetchUserForumFeedQueryHandler,
  FetchForumCommentsQueryHandler,
];
