import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentBuilder } from '@nestjs/swagger';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Account } from '@app/common/src/models/account.model';
import { setupSwaggerDocument } from '@app/common/src/swagger';
import { AppLogger } from '@app/common/src/logger/logger.service';
import { EngagementServiceEventHandlers } from './events/handlers';
import { EngagementServiceQueryHandlers } from './queries/handlers';
import { EngagementServiceCommandHandlers } from './commands/handlers';
import { GetSystemJWTModule } from '@app/common/src/middlewares/config';
import { Forum, ForumComment } from '@app/common/src/models/forum.model';
import { HelperServiceModule } from '@app/helper-service/src/helper-service.module';
import { ForumController } from './controllers/forum.controller';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    GetSystemJWTModule(),
    HelperServiceModule,
    TypeOrmModule.forFeature([Account, Forum, ForumComment]),
  ],
  providers: [
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
    ...EngagementServiceQueryHandlers,
    ...EngagementServiceEventHandlers,
    ...EngagementServiceCommandHandlers,
  ],
  exports: [],
  controllers: [ForumController],
})
export class EngagementServiceModule {
  constructor(private configService: ConfigService) {
    setupSwaggerDocument(
      'engagement-service',
      new DocumentBuilder()
        .addBearerAuth()
        .addServer(this.configService.get<string>('API_HOST'))
        .setTitle('Engagement Docs')
        .setDescription('Engagement endpoints...')
        .setVersion('1.0')
        .build(),
    )(EngagementServiceModule);
  }
}
