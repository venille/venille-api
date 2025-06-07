import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentBuilder } from '@nestjs/swagger';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Course } from '@app/common/src/models/course.model';
import { Account } from '@app/common/src/models/account.model';
import { setupSwaggerDocument } from '@app/common/src/swagger';
import { ForumController } from './controllers/forum.controller';
import { AppLogger } from '@app/common/src/logger/logger.service';
import { CourseController } from './controllers/course.controller';
import { EngagementServiceEventHandlers } from './events/handlers';
import { EngagementServiceQueryHandlers } from './queries/handlers';
import { EngagementServiceCommandHandlers } from './commands/handlers';
import { GetSystemJWTModule } from '@app/common/src/middlewares/config';
import { Forum, ForumComment } from '@app/common/src/models/forum.model';
import { TranslationController } from './controllers/translation.controller';
import { HelperServiceModule } from '@app/helper-service/src/helper-service.module';
import { TextTranslationService } from '@app/helper-service/src/services/text-translation.service';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    GetSystemJWTModule(),
    HelperServiceModule,
    TypeOrmModule.forFeature([Account, Forum, ForumComment, Course]),
  ],
  providers: [
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
      TextTranslationService,
    ...EngagementServiceQueryHandlers,
    ...EngagementServiceEventHandlers,
    ...EngagementServiceCommandHandlers,
  ],
  exports: [],
  controllers: [TranslationController, CourseController, ForumController],
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
