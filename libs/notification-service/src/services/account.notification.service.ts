import { FindManyOptions, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SecureUserPayload } from '@app/common/src/interface';
import { AppLogger } from '../../../common/src/logger/logger.service';
import {
  Notification,
  NotificationInfo,
  NotificationsResponse,
} from '@app/common/src/models/notification.model';
import modelsFormatter from '@app/common/src/middlewares/models.formatter';

@Injectable()
export class AccountNotificationService {
  constructor(
    private configService: ConfigService,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async fetchUserNotifications(
    secureUser: SecureUserPayload,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<NotificationsResponse> {
    const options: FindManyOptions<Notification> = {
      where: {
        account: {
          email: secureUser.email,
        },
      },
      relations: ['product', 'user'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: {
        createdAt: 'DESC',
      },
    };

    const [notifications, totalCount] = await Promise.all([
      this.notificationRepository.find(options),
      this.notificationRepository.count(options),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNext = page < totalPages;

    this.logger.log(`[FETCH-NOTIFICATIONS-SUCCESS]`);

    const formattedNotifications = notifications.map((notification) =>
      modelsFormatter.FormatNotification(notification),
    );

    return {
      notifications: formattedNotifications,
      totalPages,
      hasNextPage: hasNext,
    };
  }

  async readNotification(
    secureUser: SecureUserPayload,
    notificationId: string,
  ): Promise<NotificationInfo> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        account: {
          email: secureUser.email,
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    Object.assign(notification, { isRead: true });

    await this.notificationRepository.save(notification);

    this.logger.log(`[FETCH-NOTIFICATIONS-SUCCESS]`);

    return modelsFormatter.FormatNotification(notification);
  }
}
