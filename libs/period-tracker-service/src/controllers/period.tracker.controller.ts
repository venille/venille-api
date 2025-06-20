import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
  FetchPeriodTrackerHistoryQuery,
  FetchDashboardPeriodTrackerHistoryQuery,
  FetchPeriodLogHistoryQuery,
} from '../queries/impl';
import {
  PeriodTrackerInfo,
  DashboardTrackerInfo,
  PeriodLogInfo,
} from '@app/common/src/models/period.record.model';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SecureUserPayload } from '@app/common/src/interface';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { SecureUser } from '@app/common/src/decorator/user.decorator';
import { PeriodTrackerService } from '../services/period.tracker.service';

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
  @Get('history')
  @ApiOkResponse({ type: PeriodTrackerInfo, isArray: true })
  @ApiInternalServerErrorResponse()
  async getPeriodTrackerHistory(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<PeriodTrackerInfo[]> {
    return this.queryBus.execute(
      new FetchPeriodTrackerHistoryQuery(secureUser),
    );
  }

  @ApiTags('period-tracker')
  @Get('log/history')
  @ApiOkResponse({ type: PeriodLogInfo, isArray: true })
  @ApiInternalServerErrorResponse()
  async getPeriodLogHistory(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<PeriodLogInfo[]> {
    return this.queryBus.execute(new FetchPeriodLogHistoryQuery(secureUser));
  }

  @ApiTags('period-tracker')
  @Get('dashboard')
  @ApiOkResponse({ type: DashboardTrackerInfo })
  @ApiInternalServerErrorResponse()
  async getDashboardPeriodTrackerHistory(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<DashboardTrackerInfo> {
    return this.queryBus.execute(
      new FetchDashboardPeriodTrackerHistoryQuery(secureUser),
    );
  }
}
