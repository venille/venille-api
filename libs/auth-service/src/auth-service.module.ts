import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentBuilder } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthServiceEventHandlers } from './events/handlers';
import { Account } from 'libs/common/src/models/account.model';
import { AuthController } from './controllers/auth.controller';
import { setupSwaggerDocument } from '../../common/src/swagger';
import { AuthServiceCommandHandlers } from './commands/handlers';
import { Referral } from '@app/common/src/models/referral.model';
import { AppLogger } from '../../common/src/logger/logger.service';
import { GetSystemJWTModule } from 'libs/common/src/middlewares/config';
import { Notification } from '@app/common/src/models/notification.model';
import { AuthHelperController } from './controllers/auth.helper.controller';
import { HelperServiceModule } from 'libs/helper-service/src/helper-service.module';
import { AddressHelperController } from 'libs/helper-service/src/controllers/address.helper.controller';
import { AuthEmailNotificationService } from '@app/notification-service/src/services/email/auth.email.notification.service';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    GetSystemJWTModule(),
    HelperServiceModule,
    TypeOrmModule.forFeature([
      Account,
      Referral,
      Notification,
    ]),
  ],
  providers: [
    AuthService,
    {
      provide: 'Logger',
      useClass: AppLogger,
    },
    AuthEmailNotificationService,
    ...AuthServiceEventHandlers,
    ...AuthServiceCommandHandlers,
  ],
  exports: [AuthService],
  controllers: [AuthController, AuthHelperController, AddressHelperController],
})
export class AuthServiceModule {
  constructor(private configService: ConfigService) {
    setupSwaggerDocument(
      'auth-service',
      new DocumentBuilder()
        .addBearerAuth()
        .addServer(this.configService.get<string>('API_HOST'))
        .setTitle('Auth Docs')
        .setDescription('Authentication endpoints...')
        .setVersion('1.0')
        .build(),
    )(AuthServiceModule);
  }
}
