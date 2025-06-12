import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
  OrderInfo,
  OrderHistoryResponse,
} from '@app/common/src/models/order.model';
import { OrderSanitaryPadDTO } from '../interface';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OrderSanitaryPadCommand } from '../commands/impl';
import { AccountService } from '../services/account.service';
import { SecureUserPayload } from '@app/common/src/interface';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { FetchSanitaryPadOrderHistoryQuery } from '../queries/impl';
import { SecureUser } from '@app/common/src/decorator/user.decorator';

@Controller({ path: 'order' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    public readonly queryBus: QueryBus,
    public readonly commandBus: CommandBus,
    public readonly accountService: AccountService,
  ) {}

  @ApiTags('order')
  @Get('sanitary-pad/history')
  @ApiOkResponse({ type: OrderHistoryResponse })
  @ApiQuery({
    type: Number,
    required: true,
    name: 'page',
    example: 1,
    description: 'Page',
  })
  @ApiQuery({
    type: Number,
    required: true,
    name: 'pageSize',
    example: 20,
    description: 'Page size',
  })
  @ApiInternalServerErrorResponse()
  async fetchSanitaryPadOrderHistory(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<OrderHistoryResponse> {
    return await this.queryBus.execute(
      new FetchSanitaryPadOrderHistoryQuery(page, pageSize, secureUser),
    );
  }

  @ApiTags('order')
  @Post('sanitary-pad/new')
  @ApiOkResponse({ type: OrderInfo })
  @ApiInternalServerErrorResponse()
  async orderSanitaryPad(
    @Req() req: Request,
    @Body() payload: OrderSanitaryPadDTO,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<OrderInfo> {
    return await this.commandBus.execute(
      new OrderSanitaryPadCommand(payload, secureUser),
    );
  }
}
