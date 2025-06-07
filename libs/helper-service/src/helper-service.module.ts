import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './services/seeder.service';
import { S3UploadService } from './services/s3-upload.service';
import { HelperServiceQueryHandlers } from './queries/handlers';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { ImageUploadService } from './services/image-upload.service';
import { EmailSenderService } from './services/email-sender.service';
import { GoogleLocationService } from './services/google-location.service';
import { AddressHelperService } from './services/address.helper.service';
import { AddressHelperController } from './controllers/address.helper.controller';
import { TextTranslationService } from './services/text-translation.service';

@Module({
  imports: [CqrsModule, ConfigModule, TypeOrmModule.forFeature([])],
  exports: [
    AddressHelperService,
    ImageUploadService,
    S3UploadService,
    GoogleLocationService,
    EmailSenderService,
    SeederService,
    TextTranslationService,
  ],
  providers: [
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
    AddressHelperService,
    ImageUploadService,
    S3UploadService,
    GoogleLocationService,
    EmailSenderService,
    SeederService,
    TextTranslationService,
    ...HelperServiceQueryHandlers,
  ],
  controllers: [AddressHelperController],
})
export class HelperServiceModule {}
