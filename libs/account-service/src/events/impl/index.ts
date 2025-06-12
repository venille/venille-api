import { Order } from '@app/common/src/models/order.model';
import { Account } from '@app/common/src/models/account.model';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';

export class OrderSanitaryPadEvent {
  constructor(
    public readonly order: Order,
    public readonly account: Account,
  ) {}
}

export class RegisterPeriodTrackerEvent {
  constructor(
    public readonly account: Account,
    public readonly periodTracker: PeriodTracker,
  ) {}
}
