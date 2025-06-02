import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import {
  Forum,
  ForumComment,
  ForumCommentInfo,
  ForumInfo,
} from '@app/common/src/models/forum.model';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeUnlikeForumPostCommand } from '../impl';
import { NewForumCommentEvent } from '../../events/impl';
import { Inject, NotFoundException } from '@nestjs/common';
import { Account } from '@app/common/src/models/account.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';

@CommandHandler(LikeUnlikeForumPostCommand)
export class LikeUnlikeForumPostHandler
  implements ICommandHandler<LikeUnlikeForumPostCommand, ForumInfo>
{
  constructor(
    private readonly eventBus: EventBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(ForumComment)
    private readonly forumCommentRepository: Repository<ForumComment>,
  ) {}

  async execute(command: LikeUnlikeForumPostCommand) {
    try {
      this.logger.log(`[CREATE-FORUM-COMMENT-HANDLER-PROCESSING]`);

      const { forumId, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const _forum = await this.forumRepository.findOne({
        where: {
          id: forumId,
        },
      });

      if (!_forum) {
        throw new NotFoundException('Forum not found');
      }

      // console.log(_forum.likes);

      Object.assign(_forum, {
        likes:
          _forum.likes && _forum.likes.includes(account.id.toString())
            ? JSON.stringify(JSON.parse(_forum.likes).filter(
                (id: string) => id !== account.id.toString(),
              ))
            : JSON.stringify([...JSON.parse(_forum.likes), account.id.toString()]),
      });

      await this.forumRepository.save(_forum);

      const forum = await this.forumRepository.findOne({
        where: {
          id: forumId,
        },
      });

      this.logger.log(`[LIKE-UNLIKE-FORUM-POST-HANDLER-SUCCESS]`);

      return modelsFormatter.FormatForumInfo(forum);
    } catch (error) {
      this.logger.log(`[LIKE-UNLIKE-FORUM-POST-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
