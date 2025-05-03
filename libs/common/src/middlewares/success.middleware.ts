import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class SuccessResponseMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;
    // Update the send method to return the result of originalSend
    res.send = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (body === undefined) {
          return originalSend.call(res, { success: true }); // Return the result
        } else {
          return originalSend.call(res, body); // Return the result
        }
      } else {
        return originalSend.call(res, body); // Return the result
      }
    };
    next();
  }
}