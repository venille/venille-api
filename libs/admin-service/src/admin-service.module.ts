import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentBuilder } from '@nestjs/swagger';
import { AdminService } from './services/admin.service';
import { Forum } from '@app/common/src/models/forum.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Course } from '@app/common/src/models/course.model';
import { Account } from 'libs/common/src/models/account.model';
import { setupSwaggerDocument } from 'libs/common/src/swagger';
import { AdminController } from './controllers/admin.controller';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { GetSystemJWTModule } from '@app/common/src/middlewares/config';
import { SeederService } from 'libs/helper-service/src/services/seeder.service';
import { S3UploadService } from 'libs/helper-service/src/services/s3-upload.service';
import { SeederController } from 'libs/helper-service/src/controllers/seeder.controller';
import { ImageUploadService } from 'libs/helper-service/src/services/image-upload.service';
import { GoogleLocationService } from 'libs/helper-service/src/services/google-location.service';

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    GetSystemJWTModule(),
    TypeOrmModule.forFeature([Account, Course, Forum]),
  ],
  providers: [
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
    AdminService,
    SeederService,
    S3UploadService,
    ImageUploadService,
    GoogleLocationService,
  ],
  exports: [],
  controllers: [AdminController, SeederController],
})
export class AdminServiceModule {
  constructor(private configService: ConfigService) {
    setupSwaggerDocument(
      'admin-service',
      new DocumentBuilder()
        .addBearerAuth()
        .addServer(this.configService.get<string>('API_HOST'))
        .setTitle('Admin Docs')
        .setDescription('Admin endpoints...')
        .setVersion('1.0')
        .build(),
    )(AdminServiceModule);
  }
}
