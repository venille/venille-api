import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import {
  Order,
  OrderHistoryResponse,
} from '@app/common/src/models/order.model';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FetchSanitaryPadOrderHistoryQuery } from '../impl';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { FormatOrderInfo } from '@app/common/src/middlewares/models.formatter';

@QueryHandler(FetchSanitaryPadOrderHistoryQuery)
export class FetchSanitaryPadOrderHistoryQueryHandler
  implements
    IQueryHandler<FetchSanitaryPadOrderHistoryQuery, OrderHistoryResponse>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async execute(query: FetchSanitaryPadOrderHistoryQuery) {
    try {
      const { secureUser, page, pageSize } = query;

      this.logger.log(
        `[FETCH-SANITARY-PAD-ORDER-HISTORY-QUERY-HANDLER-PROCESSING]: ${JSON.stringify(query)}`,
      );

      const [orders, totalCount] = await this.orderRepository.findAndCount({
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

      const result = orders.map(FormatOrderInfo);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNext = page < totalPages;

      this.logger.log(
        `[FETCH-SANITARY-PAD-ORDER-HISTORY-QUERY-HANDLER-SUCCESS]`,
      );

      return {
        orders: result,
        totalPages,
        hasNext,
      } as OrderHistoryResponse;
    } catch (error) {
      this.logger.log(
        `[FETCH-SANITARY-PAD-ORDER-HISTORY-QUERY-HANDLER-ERROR]: ${error}`,
      );

      throw error;
    }
  }
}
