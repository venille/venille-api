import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MonthlySurvey,
  MonthlySurveyHistoryResponse,
} from '@app/common/src/models/monthly.survey.model';
import { FetchMonthlySurveyHistoryQuery } from '../impl';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { FormatMonthlySurveyInfo } from '@app/common/src/middlewares/models.formatter';

@QueryHandler(FetchMonthlySurveyHistoryQuery)
export class FetchMonthlySurveyHistoryQueryHandler
  implements
    IQueryHandler<FetchMonthlySurveyHistoryQuery, MonthlySurveyHistoryResponse>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(MonthlySurvey)
    private readonly monthlySurveyRepository: Repository<MonthlySurvey>,
  ) {}

  async execute(query: FetchMonthlySurveyHistoryQuery) {
    try {
      const { secureUser, page, pageSize } = query;

      this.logger.log(
        `[FETCH-MONTHLY-SURVEY-HISTORY-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      const [surveys, totalCount] =
        await this.monthlySurveyRepository.findAndCount({
          where: {
            account: {
              id: secureUser.id,
            },
          },
          order: {
            createdAt: 'DESC',
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        });

      const result = surveys.map(FormatMonthlySurveyInfo);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNext = page < totalPages;

      this.logger.log(`[FETCH-MONTHLY-SURVEY-HISTORY-QUERY-HANDLER-SUCCESS]`);

      return {
        surveys: result,
        totalPages,
        hasNext,
      } as MonthlySurveyHistoryResponse;
    } catch (error) {
      this.logger.log(
        `[FETCH-MONTHLY-SURVEY-HISTORY-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}
