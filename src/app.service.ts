import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Venille Period Tracker Server(v1)';
  }
}
