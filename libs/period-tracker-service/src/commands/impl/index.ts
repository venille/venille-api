import { LogPeriodSymptomDto, PeriodTrackerHistoryDto } from '../../interface';
import { SecureUserPayload } from '@app/common/src/interface';

export class LogPeriodSymptomsCommand {
  constructor(
    public readonly payload: LogPeriodSymptomDto,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class LogPeriodHistoryCommand {
  constructor(
    public readonly payload: PeriodTrackerHistoryDto,
    public readonly secureUser: SecureUserPayload,
  ) {}
}
