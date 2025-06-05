import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { AppLogger } from '../../../common/src/logger/logger.service';

@Injectable()
export class PeriodTrackerService {
  constructor(
    private configService: ConfigService,
    @Inject('Logger') private readonly logger: AppLogger,
  ) {}
}
