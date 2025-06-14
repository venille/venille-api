import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { OrderSanitaryPadCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderSanitaryPadEvent } from '../../events/impl';
import { Account } from 'libs/common/src/models/account.model';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { Order, OrderInfo } from '@app/common/src/models/order.model';
import { OrderDeliveryMethod } from '@app/common/src/constants/enums';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';
import { FormatOrderInfo } from '@app/common/src/middlewares/models.formatter';
import { ReferenceHelpers } from '@app/common/src/helpers/reference';

@CommandHandler(OrderSanitaryPadCommand)
export class OrderSanitaryPadHandler
  implements ICommandHandler<OrderSanitaryPadCommand, OrderInfo>
{
  constructor(
    public readonly eventBus: EventBus,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(command: OrderSanitaryPadCommand) {
    try {
      this.logger.log(`ORDER-SANITARY-PAD-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw UserNotFoundException();
      }

      const order = this.orderRepository.create({
        account,
        address: payload.address,
        quantity: payload.quantity,
        buildingNumber: payload.buildingNumber,
        nearestLandmark: payload.nearestLandmark,
        deliveryMethod:
          payload.deliveryMethod === 'PickUp'
            ? OrderDeliveryMethod.Pickup
            : OrderDeliveryMethod.Delivery,
        orderId: ReferenceHelpers.makeOrderReference(),
      });

      await this.orderRepository.save(order);

      //! INITIALIZE EVENT TO SEND ADMIN EMAIL
      this.eventBus.publish(new OrderSanitaryPadEvent(order, account));

      this.logger.log(`ORDER-SANITARY-PAD-HANDLER-SUCCESS]`);

      return FormatOrderInfo(order);
    } catch (error) {
      this.logger.log(`ORDER-SANITARY-PAD-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
