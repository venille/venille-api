
import { Repository } from 'typeorm';
import { DeleteForumCommentCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { Forum, ForumComment } from '@app/common/src/models/forum.model';
import { Inject, NotFoundException } from '@nestjs/common';
import { Account } from '@app/common/src/models/account.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(DeleteForumCommentCommand)
export class DeleteForumCommentHandler
  implements ICommandHandler<DeleteForumCommentCommand, boolean>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(ForumComment)
    private readonly forumCommentRepository: Repository<ForumComment>,
  ) {}

  async execute(command: DeleteForumCommentCommand) {
    try {
      this.logger.log(`[DELETE-FORUM-COMMENT-HANDLER-PROCESSING]`);

      const { commentId, secureUser } = command;

      const forumComment = await this.forumCommentRepository.findOne({
        where: {
          id: commentId,
          account: {
            id: secureUser.id,
          },
        },
      });

      if (!forumComment) {
        throw new NotFoundException('Forum comment not found');
      }

      await this.forumCommentRepository.delete(forumComment);

      this.logger.log(`[DELETE-FORUM-COMMENT-HANDLER-SUCCESS]`);

      return true;
    } catch (error) {
      this.logger.log(`[DELETE-FORUM-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
