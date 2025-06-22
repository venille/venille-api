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
} from '../commands/impl';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SecureUserPayload } from '@app/common/src/interface';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { SecureUser } from '@app/common/src/decorator/user.decorator';
import { PeriodTrackerService } from '../services/period.tracker.service';
import { FetchPredictedPeriodTrackerHistoryQuery } from '../queries/impl';
import { LogPeriodSymptomDto, PeriodTrackerHistoryDto } from '../interface';
import { PeriodTrackerHistory } from '@app/common/src/models/period.record.model';

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
