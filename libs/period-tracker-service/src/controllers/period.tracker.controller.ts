import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SecureUserPayload } from '@app/common/src/interface';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FetchPeriodTrackerHistoryQuery } from '../queries/impl';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { SecureUser } from '@app/common/src/decorator/user.decorator';
import { PeriodTrackerService } from '../services/period.tracker.service';
import { PeriodTrackerInfo } from '@app/common/src/models/period.record.model';

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
  async getDetailedAccountInfo(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<PeriodTrackerInfo[]> {
    return this.queryBus.execute(
      new FetchPeriodTrackerHistoryQuery(secureUser),
    );
  }
}
