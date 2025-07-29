import {
  LogPeriodSymptomDto,
  PeriodTrackerHistoryDto,
  UpdateCycleAndOvulationSettingsDto,
} from '../../interface';
import { SecureUserPayload } from '@app/common/src/interface';

export class LogPeriodSymptomsCommand {
  constructor(
    public readonly payload: LogPeriodSymptomDto,
    public readonly secureUser: SecureUserPayload,
  ) {}
}

export class UpdateCycleAndOvulationSettingsCommand {
  constructor(
    public readonly secureUser: SecureUserPayload,
    public readonly payload: UpdateCycleAndOvulationSettingsDto,
  ) {}
}

export class LogPeriodHistoryCommand {
  constructor(
    public readonly payload: PeriodTrackerHistoryDto,
    public readonly secureUser: SecureUserPayload,
  ) {}
}
