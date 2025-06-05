import { Account } from '@app/common/src/models/account.model';
import { PeriodTracker } from '@app/common/src/models/period.tracker.model';

export class RegisterPeriodTrackerEvent {
  constructor(
    public readonly account: Account,
    public readonly periodTracker: PeriodTracker,
  ) {}
}
