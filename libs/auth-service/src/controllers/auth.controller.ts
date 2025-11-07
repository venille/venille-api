import { CommandBus } from '@nestjs/cqrs';
import {
  SigninDTO,
  SigninResponsePayload,
  SignupResponsePayload,
  SignupVerificationResponsePayload,
  ResetPasswordOTPVerificationResponsePayload,
  ClinicalTrialSimulationDTO,
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
  ApiBody,
  ApiExtraModels,
  ApiConflictResponse,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
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
import {
  Body,
  Controller,
  Post,
  Query,
  Req,
  UploadedFile,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { GirlifiedAIInfo } from '../interface/schema';

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
      new CreateAccountCommand(authUtils.getOriginHeader(req), body),
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
  @ApiOkResponse({ type: String })
  @ApiQuery({
    type: String,
    name: 'query',
    required: true,
    example: 'Explain how AI works in a few words',
    description: 'What do you want to ask the AI',
  })
  @ApiConflictResponse()
  async generateVellaAiPrompt(
    @Req() req: Request,
    @Query('query') query: string,
  ): Promise<string> {
    return await this.authService.generateVellaAiAPI(query);
  }

  @ApiTags('ai')
  @Post('generate-girlified-ai-report')
  // @ApiOkResponse({ type: GirlifiedAIInfo })
  @ApiOkResponse({ type: String })
  @ApiExtraModels(ClinicalTrialSimulationDTO)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Provide AI Clinical Trial Simulation parameters and upload image files of your test strips.',
    required: true,
    schema: {
      type: 'object',
      allOf: [{ $ref: getSchemaPath(ClinicalTrialSimulationDTO) }],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiQuery({
    type: String,
    name: 'threadId',
    required: false,
    // example: '190039',
    description: 'Thread ID of the chat conversation.',
  })
  @ApiConflictResponse()
  async generateGirlifiedAIReport(
    @Req() req: Request,
    @Body() body: ClinicalTrialSimulationDTO,
    @Query('threadId') threadId?: string,
    @Res({ passthrough: true }) res?: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<string> {
    // ): Promise<GirlifiedAIInfo> {
    return await this.authService.generateGirlifiedAIReport(files, body, threadId);
  }

  @ApiTags('ai')
  @Post('generate-girlified-smart-pad-report')
  @ApiOkResponse({ type: String })
  @UseInterceptors(FileInterceptor('file'))
  @ApiQuery({
    type: String,
    name: 'email',
    required: true,
    example: 'tisanyada@gmail.com',
    description: 'Email of the test recipient.',
  })
  @ApiQuery({
    type: String,
    name: 'name',
    required: true,
    example: 'Jeremy Grant',
    description: 'Name of the test recipient.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image file of your test strip.',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConflictResponse()
  async generateGirlifiedSmartPadReport(
    @Req() req: Request,
    @Query('email') email: string,
    @Query('name') name: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return await this.authService.generateGirlifiedSmartPadReport(
      email,
      name,
      file,
    );
  }

  @ApiTags('ai')
  @Post('process-greeneden-gpt')
  @ApiOkResponse({ type: String })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image file of your test strip.',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConflictResponse()
  async processGreenEdenGpt(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return await this.authService.processGreenEdenGpt(file);
  }
}
