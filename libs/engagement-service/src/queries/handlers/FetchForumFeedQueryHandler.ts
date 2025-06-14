import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { FetchForumFeedQuery } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import {
  Forum,
  ForumFeedResponse,
  ForumInfo,
} from '@app/common/src/models/forum.model';
import { FormatForumInfo } from '@app/common/src/middlewares/models.formatter';

@QueryHandler(FetchForumFeedQuery)
export class FetchForumFeedQueryHandler
  implements IQueryHandler<FetchForumFeedQuery, ForumFeedResponse>
{
  constructor(
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(query: FetchForumFeedQuery) {
    try {
      const { page, pageSize, secureUser } = query;

      const cacheKey = `forum_feed_${page}_${pageSize}`;

      const cachedResult =
        await this.cacheManager.get<ForumFeedResponse>(cacheKey);
      if (cachedResult) {
        this.logger.log(
          `[FETCH-FORUM-FEED-QUERY-HANDLER-CACHE-HIT]: ${cacheKey}`,
        );
        // return cachedResult;
      }

      this.logger.log(
        `[FETCH-FORUM-FEED-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      const [forums, totalCount] = await this.forumRepository.findAndCount({
        take: pageSize,
        skip: (page - 1) * pageSize,
        order: {
          createdAt: 'DESC',
        },
      });

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNext = page < totalPages;

      const result = {
        totalPages,
        hasNextPage: hasNext,
        forums: forums.map((forum) => FormatForumInfo(forum)),
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
