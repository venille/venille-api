import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteForumCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '@app/common/src/models/account.model';
import { Forum, ForumInfo } from '@app/common/src/models/forum.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { AuthService } from '@app/auth-service/src/services/auth.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AuthEmailNotificationService } from 'libs/notification-service/src/services/email/auth.email.notification.service';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';

@CommandHandler(DeleteForumCommand)
export class DeleteForumHandler
  implements ICommandHandler<DeleteForumCommand, boolean>
{
  constructor(
    private readonly eventBus: EventBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
  ) {}

  async execute(command: DeleteForumCommand) {
    try {
      this.logger.log(`[DELETE-FORUM-HANDLER-PROCESSING]`);

      const { forumId, secureUser } = command;

      const forum = await this.forumRepository.findOne({
        where: {
          id: forumId,
          account: {
            id: secureUser.id,
          },
        },
      });

      if (!forum) {
        throw new NotFoundException('Forum not found');
      }

      await this.forumRepository.delete(forumId);

      this.logger.log(`[DELETE-FORUM-HANDLER-SUCCESS]`);

      return true;
    } catch (error) {
      this.logger.log(`[DELETE-FORUM-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
