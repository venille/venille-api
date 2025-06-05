import {
  Body,
  Controller,
  Delete,
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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AccountService } from '../services/account.service';
import { SecureUserPayload } from '@app/common/src/interface';
import { FetchOnboardingQuestionsQuery } from '../queries/impl';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { SecureUser } from '@app/common/src/decorator/user.decorator';
import { OnboardingQuestionInfo } from '@app/common/src/models/onboarding.question.model';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';
import { RegisterPeriodTrackerDTO } from '../interface';
import { RegisterPeriodTrackerCommand } from '../commands/impl';
import authUtils from '@app/common/src/security/auth.utils';
import { AccountInfo } from '@app/common/src/models/account.model';

@Controller({ path: 'onboarding' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(
    public readonly queryBus: QueryBus,
    public readonly command: CommandBus,
    public readonly accountService: AccountService,
  ) {}

  @ApiTags('onboarding')
  @Get('questions')
  @ApiOkResponse({ type: OnboardingQuestionInfo, isArray: true })
  @ApiInternalServerErrorResponse()
  async getOnboardingQuestions(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<OnboardingQuestionInfo[]> {
    return await this.queryBus.execute(
      new FetchOnboardingQuestionsQuery(secureUser),
    );
  }

  @ApiTags('onboarding')
  @Post('period-tracker')
  @ApiOkResponse({ type: AccountInfo })
  @ApiInternalServerErrorResponse()
  async registerPeriodTracker(
    @Req() req: Request,
    @SecureUser() secureUser: SecureUserPayload,
    @Body() registerPeriodTrackerDTO: RegisterPeriodTrackerDTO,
  ): Promise<AccountInfo> {
    return await this.command.execute(
      new RegisterPeriodTrackerCommand(
        authUtils.getOriginHeader(req),
        secureUser,
        registerPeriodTrackerDTO,
      ),
    );
  }
}
