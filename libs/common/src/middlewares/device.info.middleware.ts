import {UAParser} from 'ua-parser-js';
import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class DeviceInfoMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'];
    if (userAgent) {
      const parser = new UAParser(userAgent);
      const deviceInfo = parser.getResult();

      req['deviceInfo'] = deviceInfo;
    } else {
      req['deviceInfo'] = null;
    }
    next();
  }
}
