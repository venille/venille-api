import {
  Body,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  Controller,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CreateForumCommentDto, CreateForumDto } from '../interface';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateForumCommand,
  CreateForumCommentCommand,
  DeleteForumCommand,
  DeleteForumCommentCommand,
  LikeUnlikeForumPostCommand,
} from '../commands/impl';
import { SecureUserPayload } from '@app/common/src/interface';
import { AccountInfo } from '@app/common/src/models/account.model';
import { JwtAuthGuard } from '@app/common/src/auth/jwt-auth.guard';
import { SecureUser } from '@app/common/src/decorator/user.decorator';
import {
  FetchForumCommentsQuery,
  FetchForumFeedQuery,
  FetchUserForumFeedQuery,
} from '../queries/impl';
import {
  ForumCommentInfo,
  ForumCommentsResponse,
  ForumFeedResponse,
  ForumInfo,
} from '@app/common/src/models/forum.model';

@Controller({ path: 'forum' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ForumController {
  constructor(
    public queryBus: QueryBus,
    public commandBus: CommandBus,
  ) {}

  @ApiTags('forum')
  @Get('feed')
  @ApiOkResponse({ type: ForumFeedResponse })
  @ApiQuery({ name: 'page', example: 1, type: Number, required: true })
  @ApiQuery({ name: 'pageSize', example: 20, type: Number, required: true })
  @ApiInternalServerErrorResponse()
  async fetchForumFeed(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<ForumFeedResponse> {
    return await this.queryBus.execute(
      new FetchForumFeedQuery(page, pageSize, secureUser),
    );
  }

  @ApiTags('forum')
  @Get('feed/comments')
  @ApiOkResponse({ type: ForumCommentsResponse })
  @ApiQuery({ name: 'page', example: 1, type: Number, required: true })
  @ApiQuery({ name: 'forumId', example: 1, type: Number, required: true })
  @ApiQuery({ name: 'pageSize', example: 20, type: Number, required: true })
  @ApiInternalServerErrorResponse()
  async fetchForumComments(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('forumId') forumId: number,
    @Query('pageSize') pageSize: number,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<ForumCommentsResponse> {
    return await this.queryBus.execute(
      new FetchForumCommentsQuery(forumId, page, pageSize, secureUser),
    );
  }

  @ApiTags('forum')
  @Post('feed/like-unlike')
  @ApiOkResponse({ type: ForumInfo })
  @ApiQuery({ name: 'forumId', example: 1, type: Number, required: true })
  @ApiInternalServerErrorResponse()
  async likeUnlikeForumPost(
    @Req() req: Request,
    @Query('forumId') forumId: number,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<ForumInfo> {
    return await this.commandBus.execute(
      new LikeUnlikeForumPostCommand(forumId, secureUser),
    );
  }

  @ApiTags('forum')
  @Post('feed/add-comment')
  @ApiOkResponse({ type: ForumCommentInfo })
  @ApiQuery({ name: 'forumId', example: 1, type: Number, required: true })
  @ApiInternalServerErrorResponse()
  async addForumComment(
    @Req() req: Request,
    @Query('forumId') forumId: number,
    @Body() payload: CreateForumCommentDto,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<ForumCommentInfo> {
    return await this.commandBus.execute(
      new CreateForumCommentCommand(forumId, payload, secureUser),
    );
  }

  @ApiTags('forum')
  @Delete('feed/delete-comment')
  @ApiOkResponse({ type: Boolean })
  @ApiQuery({ name: 'commentId', example: 1, type: Number, required: true })
  @ApiInternalServerErrorResponse()
  async deleteForumComment(
    @Req() req: Request,
    @Query('commentId') commentId: number,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new DeleteForumCommentCommand(commentId, secureUser),
    );
  }

  @ApiTags('my-forum')
  @Get('feed-me')
  @ApiOkResponse({ type: ForumFeedResponse })
  @ApiQuery({ name: 'page', example: 1, type: Number, required: true })
  @ApiQuery({ name: 'pageSize', example: 20, type: Number, required: true })
  @ApiInternalServerErrorResponse()
  async fetchUserForumFeed(
    @Req() req: Request,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<ForumFeedResponse> {
    return await this.queryBus.execute(
      new FetchUserForumFeedQuery(page, pageSize, secureUser),
    );
  }

  @ApiTags('my-forum')
  @Post('create')
  @ApiOkResponse({ type: ForumInfo })
  @ApiInternalServerErrorResponse()
  async createForum(
    @Req() req: Request,
    @Body() payload: CreateForumDto,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<ForumInfo> {
    return await this.commandBus.execute(
      new CreateForumCommand(payload, secureUser),
    );
  }

  @ApiTags('my-forum')
  @Delete('delete')
  @ApiOkResponse({ type: Boolean })
  @ApiQuery({ name: 'forumId', example: 1, type: Number, required: true })
  @ApiInternalServerErrorResponse()
  async deleteForum(
    @Req() req: Request,
    @Query('forumId') forumId: number,
    @SecureUser() secureUser: SecureUserPayload,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new DeleteForumCommand(forumId, secureUser),
    );
  }
}
