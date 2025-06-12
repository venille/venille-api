import { Inject } from '@nestjs/common';
import { OrderSanitaryPadEvent } from '../impl';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { OrderEmailNotificationService } from '@app/notification-service/src/services/email/order.email.notification.service';

@EventsHandler(OrderSanitaryPadEvent)
export class OrderSanitaryPadEventHandler
  implements IEventHandler<OrderSanitaryPadEvent>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    private readonly orderEmailNotificationService: OrderEmailNotificationService,
  ) {}

  async handle(event: OrderSanitaryPadEvent) {
    try {
      this.logger.log(
        `[ORDER-SANITARY-PAD-EVENT-HANDLER-PROCESSING]: ${JSON.stringify(event)}`,
      );

      const { account, order } = event;

      await this.orderEmailNotificationService.adminOrderSanitaryPadEmailNotification(
        {
          account,
          quantity: order.quantity.toString(),
          deliveryMethod: order.deliveryMethod,
        },
      );

      await this.orderEmailNotificationService.customerOrderSanitaryPadEmailNotification(
        {
          account,
          quantity: order.quantity.toString(),
          deliveryMethod: order.deliveryMethod,
        },
      );

      this.logger.log(`[ORDER-SANITARY-PAD-EVENT-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[ORDER-SANITARY-PAD-EVENT-HANDLER]: ${error}`);

      throw error;
    }
  }
}
