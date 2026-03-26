import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
  LogPeriodHistoryCommand,
  LogPeriodSymptomsCommand,
  UpdateCycleAndOvulationSettingsCommand,
} from '../commands/impl';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SecureUserPayload } from '@app/common/src/interface';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { SecureUser } from '@app/common/src/decorator/user.decorator';
import { PeriodTrackerService } from '../services/period.tracker.service';
import {
  FetchCycleAndOvulationInfoQuery,
  FetchDashboardInfoQuery,
  FetchPredictedPeriodTrackerHistoryQuery,
} from '../queries/impl';
import {
  LogPeriodSymptomDto,
  PeriodTrackerHistoryDto,
  UpdateCycleAndOvulationSettingsDto,
} from '../interface';
import { PeriodTrackerHistory } from '@app/common/src/models/period.record.model';
import { DashboardInfo } from '../interface/schema';
import { CycleOvulationInfo } from '@app/common/src/models/period.tracker.model';

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
  @Get('dashboard-info')
  @ApiOkResponse({ type: DashboardInfo })
  @ApiInternalServerErrorResponse()
  async getDashboardInfo(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<DashboardInfo> {
    return this.queryBus.execute(new FetchDashboardInfoQuery(secureUser));
  }

  @ApiTags('period-tracker')
  @Post('log-symptoms')
  @ApiOkResponse()
  @ApiInternalServerErrorResponse()
  async logPeriodSymptoms(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
    @Body() logPeriodSymptomDto: LogPeriodSymptomDto,
  ): Promise<void> {
    return this.command.execute(
      new LogPeriodSymptomsCommand(logPeriodSymptomDto, secureUser),
    );
  }

  @ApiTags('period-tracker')
  @Get('predicted-log')
  @ApiOkResponse({ type: PeriodTrackerHistory })
  @ApiInternalServerErrorResponse()
  async getPeriodTrackerHistory(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<PeriodTrackerHistory> {
    return await this.queryBus.execute(
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

  @ApiTags('cycle-and-ovulation')
  @Get('cycle-and-ovulation-info')
  @ApiOkResponse({ type: CycleOvulationInfo })
  @ApiInternalServerErrorResponse()
  async fetchCycleAndOvulationSettings(
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<CycleOvulationInfo> {
    return await this.queryBus.execute(
      new FetchCycleAndOvulationInfoQuery(secureUser),
    );
  }

  @ApiTags('cycle-and-ovulation')
  @Patch('update-cycle-and-ovulation-info')
  @ApiOkResponse({ type: CycleOvulationInfo })
  @ApiInternalServerErrorResponse()
  async patchCycleAndOvulationSettings(
    @SecureUser() secureUser: SecureUserPayload,
    @Body() payload: UpdateCycleAndOvulationSettingsDto,
  ): Promise<CycleOvulationInfo> {
    return await this.command.execute(
      new UpdateCycleAndOvulationSettingsCommand(secureUser, payload),
    );
  }
}
