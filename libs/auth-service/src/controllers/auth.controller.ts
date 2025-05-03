import { CommandBus } from '@nestjs/cqrs';
import {
  SigninDTO,
  SigninResponsePayload,
  SignupResponsePayload,
  SignupVerificationResponsePayload,
  ResetPasswordOTPVerificationResponsePayload,
} from '../interface';
import {
  OAuthSigninDTO,
  CreateAccountDTO,
  ResetPasswordDTO,
  ForgotPasswordDTO,
  ResetPasswordVerificationDTO,
  CompleteSignupVerificationDTO,
} from '../interface';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  SignInCommand,
  OAuthSignInCommand,
  CreateAccountCommand,
  ResetPasswordCommand,
  ForgotPasswordCommand,
  CreateAccountVerificationCommand,
  ResetPasswordOTpVerificationCommand,
} from '../commands/impl';
import { AuthService } from '../services/auth.service';
import { GenerateContentResponse } from '@google/genai';
import authUtils from 'libs/common/src/security/auth.utils';
import { Body, Controller, Post, Query, Req } from '@nestjs/common';

@Controller({ path: '' })
export class AuthController {
  constructor(
    public command: CommandBus,
    public readonly authService: AuthService,
  ) {}

  @ApiTags('auth')
  @Post('signup')
  @ApiOkResponse({ type: SignupResponsePayload })
  @ApiConflictResponse()
  async signUp(
    @Body() body: CreateAccountDTO,
    @Req() req: Request,
  ): Promise<SignupResponsePayload> {
    return await this.command.execute(
      new CreateAccountCommand(
        authUtils.getOriginHeader(req),
        body,
      ),
    );
  }

  @ApiTags('auth')
  @Post('signup-complete-verification')
  @ApiOkResponse({ type: SignupVerificationResponsePayload })
  @ApiConflictResponse()
  async signupCompleteVerification(
    @Body() body: CompleteSignupVerificationDTO,
    @Req() req: Request,
  ): Promise<SignupVerificationResponsePayload> {
    return await this.command.execute(
      new CreateAccountVerificationCommand(
        authUtils.getOriginHeader(req),
        body,
      ),
    );
  }

  @ApiTags('auth')
  @Post('signin')
  @ApiOkResponse({ type: SigninResponsePayload })
  @ApiConflictResponse()
  async signIn(
    @Body() body: SigninDTO,
    @Req() req: Request,
  ): Promise<SigninResponsePayload> {
    return await this.command.execute(
      new SignInCommand(authUtils.getOriginHeader(req), body),
    );
  }

  @ApiTags('auth')
  @Post('signin-oauth')
  @ApiOkResponse({ type: SigninResponsePayload })
  @ApiConflictResponse()
  async signinOAuth(
    @Body() body: OAuthSigninDTO,
    @Req() req: Request,
  ): Promise<SigninResponsePayload> {
    return await this.command.execute(
      new OAuthSignInCommand(authUtils.getOriginHeader(req), body),
    );
  }

  @ApiTags('password')
  @Post('forgot-password')
  @ApiOkResponse()
  @ApiConflictResponse()
  async forgotPassword(@Body() body: ForgotPasswordDTO, @Req() req: Request) {
    return await this.command.execute(
      new ForgotPasswordCommand(authUtils.getOriginHeader(req), body),
    );
  }

  @ApiTags('password')
  @Post('reset-password')
  @ApiOkResponse()
  @ApiConflictResponse()
  async resetPassword(@Body() body: ResetPasswordDTO, @Req() req: Request) {
    return await this.command.execute(
      new ResetPasswordCommand(authUtils.getOriginHeader(req), body),
    );
  }

  @ApiTags('password')
  @Post('reset-password-otp-verification')
  @ApiOkResponse({ type: ResetPasswordOTPVerificationResponsePayload })
  @ApiConflictResponse()
  async resetPasswordOtpVerification(
    @Body() body: ResetPasswordVerificationDTO,
    @Req() req: Request,
  ): Promise<ResetPasswordOTPVerificationResponsePayload> {
    return await this.command.execute(
      new ResetPasswordOTpVerificationCommand(
        authUtils.getOriginHeader(req),
        body,
      ),
    );
  }

  @ApiTags('ai')
  @Post('test-gemini')
  @ApiOkResponse({type: String})
  @ApiQuery({
    type: String,
    name: 'query',
    required: true,
    example: 'Explain how AI works in a few words',
    description: 'What do you want to ask the AI',
  })
  @ApiConflictResponse()
  async testGeminiAI(
    @Req() req: Request,
    @Query('query') query: string
  ): Promise<string> {
    return await this.authService.testGeminiAPI(query);
  }
}
