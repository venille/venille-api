import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import FCMessaging from '../bases/FCMessaging';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Account } from '@app/common/src/models/account.model';
import { AppLogger } from '@app/common/src/logger/logger.service';

@Injectable()
export class UserCronService {
  constructor(
    @InjectRepository(Account)
    private userRepository: Repository<Account>,
    @Inject('Logger') private readonly logger: AppLogger,
  ) {}
}
