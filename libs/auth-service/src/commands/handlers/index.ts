import { SignInHandler } from './SigninHandler';
import { OAuthSignInHandler } from './OAuthSigninHandler';
import { CreateAccountHandler } from './CreateAccountHandler';
import { ResetPasswordHandler } from './ResetPasswordHandler';
import { ForgotPasswordHandler } from './ForgotPasswordHandler';
import { CreateAccountVerificationHandler } from './CreateAccountVerificationHandler';
import { ResetPasswordOtpVerificationHandler } from './ResetPasswordOtpVerificationHandler';

export const AuthServiceCommandHandlers = [
  SignInHandler,
  OAuthSignInHandler,
  CreateAccountHandler,
  ResetPasswordHandler,
  ForgotPasswordHandler,
  CreateAccountVerificationHandler,
  ResetPasswordOtpVerificationHandler,
];
