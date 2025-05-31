import { Repository } from 'typeorm';
import { NewForumCommentEvent } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, NotFoundException } from '@nestjs/common';
import { Forum } from '@app/common/src/models/forum.model';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';

@EventsHandler(NewForumCommentEvent)
export class NewForumCommentEventHandler
  implements IEventHandler<NewForumCommentEvent>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
  ) {}

  async handle(event: NewForumCommentEvent) {
    try {
      this.logger.log(`[NEW-FORUM-COMMENT-EVENT-HANDLER-PROCESSING]`);

      const { forumId } = event;

      const forum = await this.forumRepository.findOne({
        where: {
          id: forumId,
        },
      });

      if (!forum) {
        throw new NotFoundException('Forum not found');
      }

      Object.assign(forum, {
        comments: forum.comments + 1,
      });

      await this.forumRepository.save(forum);

      this.logger.log(`[NEW-FORUM-COMMENT-EVENT-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[NEW-FORUM-COMMENT-EVENT-HANDLER]: ${error}`);

      throw error;
    }
  }
}
