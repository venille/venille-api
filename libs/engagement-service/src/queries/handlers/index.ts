import { FetchForumFeedQueryHandler } from './FetchForumFeedQueryHandler';
import { FetchCourseFeedQueryHandler } from './FetchCourseFeedQueryHandler';
import { FetchForumCommentsQueryHandler } from './FetchForumCommentsQueryHandler';
import { FetchUserForumFeedQueryHandler } from './FetchUserForumFeedQueryHandler';

export const EngagementServiceQueryHandlers = [
  FetchForumFeedQueryHandler,
  FetchCourseFeedQueryHandler,
  FetchUserForumFeedQueryHandler,
  FetchForumCommentsQueryHandler,
];
