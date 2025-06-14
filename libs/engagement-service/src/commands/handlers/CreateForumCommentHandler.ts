import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import {
  Forum,
  ForumComment,
  ForumCommentInfo,
} from '@app/common/src/models/forum.model';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateForumCommentCommand } from '../impl';
import { NewForumCommentEvent } from '../../events/impl';
import { Inject, NotFoundException } from '@nestjs/common';
import { Account } from '@app/common/src/models/account.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';

@CommandHandler(CreateForumCommentCommand)
export class CreateForumCommentHandler
  implements ICommandHandler<CreateForumCommentCommand, ForumCommentInfo>
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

  async execute(command: CreateForumCommentCommand) {
    try {
      this.logger.log(`[CREATE-FORUM-COMMENT-HANDLER-PROCESSING]`);

      const { forumId, payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const forum = await this.forumRepository.findOne({
        where: {
          id: forumId,
        },
      });

      if (!forum) {
        throw new NotFoundException('Forum not found');
      }

      const forumComment = await this.forumCommentRepository.save({
        forum,
        account: account,
        content: payload.content,
      });

      this.eventBus.publish(new NewForumCommentEvent(forumId));

      this.logger.log(`[CREATE-FORUM-COMMENT-HANDLER-SUCCESS]`);

      return modelsFormatter.FormatForumCommentInfo(forumComment);
    } catch (error) {
      this.logger.log(`[CREATE-FORUM-COMMENT-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
