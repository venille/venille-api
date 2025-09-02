import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Account } from '@app/common/src/models/account.model';
import { AppLogger } from '@app/common/src/logger/logger.service';
import FCMessaging from '@app/notification-service/src/bases/FCMessaging';

@Injectable()
export class PeriodTrackerCronService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly configService: ConfigService,
    @Inject('Logger') private readonly logger: AppLogger,
  ) {}

  // !MORNING -> HYDRATION NOTIFICATION
  // @Cron('*/60 * * * * *', { timeZone: 'Africa/Lagos' })
  // @Cron('30 8 * * *', { timeZone: 'Africa/Lagos' })
  async morningHydrationCronHandler() {
    try {
      this.logger.log(`[MORNING-HYDRATION-CRONJOB-PROCESSING]`);

      //   await FCMessaging.sendNotification(customer.fcmToken, {
      //     title: 'Product You May Like',
      //     body: `You may like this ${product.name} from ${product.vendor.name}. Check it out!`,
      //     data: {
      //       imageUrl: imageUrl,
      //       type: 'CUSTOMER_DAILY_PRODUCT_NOTIFICATION',
      //     },
      //   });

      this.logger.log(`[MORNING-HYDRATION-CRONJOB-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[MORNING-HYDRATION-CRONJOB-ERROR] :: ${error}`);
    }
  }
}
