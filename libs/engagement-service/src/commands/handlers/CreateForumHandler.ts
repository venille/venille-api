import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { Inject, NotFoundException } from '@nestjs/common';
import { CreateForumCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '@app/common/src/models/account.model';
import { Forum, ForumInfo } from '@app/common/src/models/forum.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { AuthService } from '@app/auth-service/src/services/auth.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AuthEmailNotificationService } from 'libs/notification-service/src/services/email/auth.email.notification.service';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';

@CommandHandler(CreateForumCommand)
export class CreateForumHandler
  implements ICommandHandler<CreateForumCommand, ForumInfo>
{
  constructor(
    private readonly eventBus: EventBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
  ) {}

  async execute(command: CreateForumCommand) {
    try {
      this.logger.log(`[CREATE-ACCOUNT-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const forum = await this.forumRepository.save({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        image: payload.image,
        account: account,
      });

      this.logger.log(`[CREATE-FORUM-HANDLER-SUCCESS]`);

      return modelsFormatter.FormatForumInfo(forum);
    } catch (error) {
      this.logger.log(`[CREATE-ACCOUNT-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
