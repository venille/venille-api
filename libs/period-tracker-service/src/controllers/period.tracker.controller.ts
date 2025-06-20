import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
  FetchPredictedPeriodTrackerHistoryQuery,
} from '../queries/impl';
import {
  PeriodTrackerHistory,
} from '@app/common/src/models/period.record.model';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SecureUserPayload } from '@app/common/src/interface';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { SecureUser } from '@app/common/src/decorator/user.decorator';
import { PeriodTrackerService } from '../services/period.tracker.service';
import { PeriodTrackerHistoryDto } from '../interface';
import { LogPeriodHistoryCommand } from '../commands/impl';

@Controller({ path: 'tracker' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PeriodTrackerController {
  constructor(
    public readonly queryBus: QueryBus,
    public readonly command: CommandBus,
    public readonly periodTrackerService: PeriodTrackerService,
  ) {}

  @ApiTags('period-tracker')
  @Get('predicted-log')
  @ApiOkResponse({ type: PeriodTrackerHistory })
  @ApiInternalServerErrorResponse()
  async getPeriodTrackerHistory(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<PeriodTrackerHistory> {
    return this.queryBus.execute(
      new FetchPredictedPeriodTrackerHistoryQuery(secureUser),
    );
  }

  @ApiTags('period-tracker')
  @Patch('predicted-log')
  @ApiOkResponse()
  @ApiInternalServerErrorResponse()
  async logPeriodTrackerHistory(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
    @Body() periodHistory: PeriodTrackerHistoryDto,
  ): Promise<void> {
    return this.command.execute(
      new LogPeriodHistoryCommand(periodHistory, secureUser),
    );
  }
}
