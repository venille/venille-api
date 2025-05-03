import helmet from 'helmet';
import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { setupSwaggerDocuments } from '../swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { initializeFirebaseAdmin } from '../firebase';


const config = {
  isDev,
  isProd,
  isTest,
  port: process.env.PORT,
  enableCors: true,
  cors: {
    origin: '*',
    methods: 'POST,GET,PUT,OPTIONS,DELETE,PATCH',
    allowedHeaders:
      'Timezone-Offset,Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization,*',
    preflightContinue: false,
    optionsSuccessStatus: 200,
  },
  auth: {
    jwtTokenExpireInSec: '1d',
    passwordResetExpireInMs: 60 * 60 * 1000,
    activationExpireInMs: 24 * 60 * 60 * 1000,
    saltRounds: 10,
    secret: process.env.JWT_SECRET ?? 'secret',
  },
  static: {
    maxAge: isProd() ? '1d' : 0,
  },
};

function isDev() {
  return process.env.NODE_ENV === 'development';
}

function isProd() {
  return process.env.NODE_ENV === 'production';
}

function isTest() {
  return process.env.NODE_ENV === 'test';
}

export default config;

export function GetSystemJWTModule() {
  return JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN_SEC },
  });
}

export const initializeApp = (app: any) => {
  initializeFirebaseAdmin();
  
  if (config.enableCors) {
    app.enableCors(config.cors);
  }
  app.use(helmet());
  app.use(compression());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.setBaseViewsDir(join(__dirname, '..', 'templates'));
  app.setViewEngine('hbs');
  setupSwaggerDocuments(app);
};
