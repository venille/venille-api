import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FetchCourseFeedQuery } from '../queries/impl';
import { SecureUserPayload } from '@app/common/src/interface';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { SecureUser } from '@app/common/src/decorator/user.decorator';
import { Get, Query, Req, UseGuards, Controller } from '@nestjs/common';
import { CourseCategoryInfo } from '@app/common/src/models/course.model';

@Controller({ path: 'course' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(
    public queryBus: QueryBus,
    public commandBus: CommandBus,
  ) {}

  @ApiTags('course')
  @Get('feed')
  @ApiOkResponse({ type: CourseCategoryInfo, isArray: true })
  @ApiQuery({ name: 'page', example: 1, type: Number, required: true })
  @ApiQuery({ name: 'pageSize', example: 5, type: Number, required: true })
  @ApiInternalServerErrorResponse()
  async fetchForumFeed(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<CourseCategoryInfo[]> {
    return await this.queryBus.execute(
      new FetchCourseFeedQuery(page, pageSize, secureUser),
    );
  }
}
