import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { AvailabilityCheckInfo } from '../interface';
import { AuthService } from '../services/auth.service';
import { Controller, Get, Patch, Query, Req } from '@nestjs/common';

@ApiTags('helpers')
@Controller({ path: 'helper' })
export class AuthHelperController {
  constructor(
    public eventBus: EventBus,
    public command: CommandBus,
    public readonly authService: AuthService,
  ) {}

  @Get('/availability/email')
  @ApiOkResponse({ type: AvailabilityCheckInfo })
  @ApiQuery({ name: 'email', type: String, example: 'devoncarter@icloud.com' })
  @ApiConflictResponse()
  async checkEmailAvailability(
    @Req() req: Request,
    @Query('email') email: string,
  ): Promise<AvailabilityCheckInfo> {
    return await this.authService.isEmailAvailable(email);
  }
}
