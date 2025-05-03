// src/common/logger/logger.service.ts
import { Logger } from 'winston';
import { createLogger, format, transports } from 'winston';
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class AppLogger implements NestLoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info', // Set the default log level (you can configure this based on your needs)
      format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
      transports: [
        new transports.Console(), // Log to the console
        // Add other transports as needed (e.g., file, database, external logging service)
      ],
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message); // Log to console using Winston's info level
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }
  debug?(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose?(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }
}

export const AppLoggerImportObj = {
  provide: 'Logger', // Use a custom provider token for clarity
  useClass: AppLogger,
};
