import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FetchOnboardingQuestionsQuery } from '../impl';
import {
  OnboardingQuestion,
  OnboardingQuestionInfo,
} from '@app/common/src/models/onboarding.question.model';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { FormatOnboardingQuestionInfo } from '@app/common/src/middlewares/models.formatter';

@QueryHandler(FetchOnboardingQuestionsQuery)
export class FetchOnboardingQuestionsQueryHandler
  implements
    IQueryHandler<FetchOnboardingQuestionsQuery, OnboardingQuestionInfo[]>
{
  constructor(
    @InjectRepository(OnboardingQuestion)
    private readonly onboardingQuestionRepository: Repository<OnboardingQuestion>,
    @Inject('Logger') private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(query: FetchOnboardingQuestionsQuery) {
    try {
      const { secureUser } = query;

      const cacheKey = `onboarding_questions`;

      const cachedResult =
        await this.cacheManager.get<OnboardingQuestionInfo[]>(cacheKey);
      if (cachedResult) {
        this.logger.log(
          `[FETCH-ONBOARDING-QUESTIONS-QUERY-HANDLER-CACHE-HIT]: ${cacheKey}`,
        );
        return cachedResult;
      }

      this.logger.log(
        `[FETCH-ONBOARDING-QUESTIONS-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      const questions = await this.onboardingQuestionRepository.find({
        order: {
          position: 'ASC',
        },
      });

      const result = questions.map((question) =>
        FormatOnboardingQuestionInfo(question),
      );

      const CACHE_TTL_MS = 1 * 60 * 1000; // 1 minute
      await this.cacheManager.set(cacheKey, result, CACHE_TTL_MS);

      this.logger.log(`[FETCH-ONBOARDING-QUESTIONS-QUERY-HANDLER-SUCCESS]`);

      return result;
    } catch (error) {
      this.logger.log(
        `[FETCH-ONBOARDING-QUESTIONS-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}
