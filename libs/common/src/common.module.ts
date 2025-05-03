import { AppLogger } from './logger/logger.service';
import { forwardRef, Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
  ],
  exports: [],
  imports: [],
})
export class CommonModule {}
