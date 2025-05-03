import {
  SigninDTO,
  OAuthSigninDTO,
  ResetPasswordDTO,
  CreateAccountDTO,
  ForgotPasswordDTO,
  ResetPasswordVerificationDTO,
  CompleteSignupVerificationDTO,
} from '../../interface';

export class SignInCommand {
  constructor(
    public readonly origin: string,
    public readonly payload: SigninDTO,
  ) {}
}

export class OAuthSignInCommand {
  constructor(
    public readonly origin: string,
    public readonly payload: OAuthSigninDTO,
  ) {}
}

export class CreateAccountCommand {
  constructor(
    public readonly origin: string,
    public readonly payload: CreateAccountDTO,
  ) {}
}

export class CreateAccountVerificationCommand {
  constructor(
    public readonly origin: string,
    public readonly payload: CompleteSignupVerificationDTO,
  ) {}
}

export class ForgotPasswordCommand {
  constructor(
    public readonly origin: string,
    public readonly payload: ForgotPasswordDTO,
  ) {}
}

export class ResetPasswordCommand {
  constructor(
    public readonly origin: string,
    public readonly payload: ResetPasswordDTO,
  ) {}
}

export class ResetPasswordOTpVerificationCommand {
  constructor(
    public readonly origin: string,
    public readonly payload: ResetPasswordVerificationDTO,
  ) {}
}
