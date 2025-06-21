import { PeriodTrackerHistoryDto } from '../../interface';
import { SecureUserPayload } from '@app/common/src/interface';

export class LogPeriodHistoryCommand {
  constructor(
    public readonly periodHistory: PeriodTrackerHistoryDto,
    public readonly secureUser: SecureUserPayload,
  ) {}
}
