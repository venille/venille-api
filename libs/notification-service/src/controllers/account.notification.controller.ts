import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
  NotificationInfo,
  NotificationsResponse,
} from '@app/common/src/models/notification.model';
import { SecureUserPayload } from '@app/common/src/interface';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { SecureUser } from '@app/common/src/decorator/user.decorator';
import { Get, Req, Controller, Query, UseGuards, Patch } from '@nestjs/common';
import { AccountNotificationService } from '../services/account.notification.service';

@ApiTags('notifications')
@Controller({ path: 'notifications' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AccountNotificationController {
  constructor(
    public readonly accountNotificationService: AccountNotificationService,
  ) {}

  @Get('')
  @ApiOkResponse({ type: NotificationsResponse })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20 })
  @ApiInternalServerErrorResponse()
  async getNotifications(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<NotificationsResponse> {
    return await this.accountNotificationService.fetchUserNotifications(
      secureUser,
      page,
      pageSize,
    );
  }

  @Patch('read')
  @ApiOkResponse({ type: NotificationInfo })
  @ApiQuery({
    name: 'notificationId',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiInternalServerErrorResponse()
  async readNotification(
    @Req() req: Request,
    @Query('notificationId') notificationId: string,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<NotificationInfo> {
    return await this.accountNotificationService.readNotification(
      secureUser,
      notificationId,
    );
  }
}
