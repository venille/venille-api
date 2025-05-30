import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import {
  ForumComment,
  ForumCommentsResponse,
} from '@app/common/src/models/forum.model';
import { FetchForumCommentsQuery } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { FormatForumCommentInfo } from '@app/common/src/middlewares/models.formatter';

@QueryHandler(FetchForumCommentsQuery)
export class FetchForumCommentsQueryHandler
  implements IQueryHandler<FetchForumCommentsQuery, ForumCommentsResponse>
{
  constructor(
    @InjectRepository(ForumComment)
    private readonly forumCommentRepository: Repository<ForumComment>,
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(query: FetchForumCommentsQuery) {
    try {
      const { page, pageSize, forumId, secureUser } = query;

      const cacheKey = `forum_feed_${page}_${pageSize}`;

      const cachedResult =
        await this.cacheManager.get<ForumCommentsResponse>(cacheKey);
      if (cachedResult) {
        this.logger.log(
          `[FETCH-FORUM-FEED-QUERY-HANDLER-CACHE-HIT]: ${cacheKey}`,
        );
        // return cachedResult;
      }

      this.logger.log(
        `[FETCH-FORUM-FEED-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      const [forums, totalCount] = await this.forumCommentRepository.findAndCount({
        where: {
          forum: {
            id: forumId,
          },
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNext = page < totalPages; 

      const result = {
        totalPages,
        hasNextPage: hasNext,
        comments: forums.map((forum) => FormatForumCommentInfo(forum)),
      };

      const CACHE_TTL_MS = 1 * 60 * 1000; // 1 minute
      await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);

      this.logger.log(`[FETCH-FORUM-FEED-QUERY-HANDLER-SUCCESS]`);

      return result;
    } catch (error) {
      this.logger.log(`[FETCH-FORUM-FEED-QUERY-HANDLER-ERROR]: ${error}`);

      throw error;
    }
  }
}
