import {
  IsHash,
  IsEnum,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  trimTransformer,
  capitalizeTransformer,
  toLowerCaseTransformer,
  capitalizeWordsTransformer,
} from '../../../common/src/helpers/local-class-validator';
import { AccountType } from 'libs/common/src/constants/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDTO {
  @ApiProperty({
    example: 'kunleadeboye@gmail.com',
    description: 'Email address of the user.',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => trimTransformer(toLowerCaseTransformer(value)))
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Password for the user account.',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @Transform(({ value }) => capitalizeTransformer(value))
  @ApiProperty({
    example: 'Kunle',
    description: 'First name of the user.',
  })
  @IsString()
  @MaxLength(16)
  @IsNotEmpty()
  firstName: string;

  @Transform(({ value }) => capitalizeTransformer(value))
  @ApiProperty({
    example: 'Adeboye',
    description: 'Last name of the user.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  lastName: string;

  @Transform(({ value }) => trimTransformer(value))
  @ApiProperty({
    example: '+2348123456789',
    description: 'Phone number of the user.',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Transform(({ value }) => trimTransformer(value))
  @ApiProperty({
    example: 'LVSX1902123',
    description: 'Referral code of the user (Optional).',
  })
  @IsOptional()
  @IsString()
  // @MaxLength(10)
  referralCode: string;

  // @ApiPropertyOptional({
  //   example: 'Lagos',
  //   description: 'State of the user.',
  // })
  // @IsString()
  // @IsOptional()
  // @Transform(({ value }: { value: string }) =>
  //   capitalizeWordsTransformer(value),
  // )
  // state: string;

  // @ApiPropertyOptional({
  //   example: 'Ikeja',
  //   description: 'City of the user.',
  // })
  // @IsString()
  // @IsOptional()
  // @Transform(({ value }: { value: string }) =>
  //   capitalizeWordsTransformer(value),
  // )
  // city: string;
}

export class CompleteSignupVerificationDTO {
  @ApiProperty()
  @IsHash('sha256')
  signupVerificationHash: string;

  @ApiProperty()
  @IsString()
  otp: string;
}

export class OAuthSigninDTO {
  @ApiProperty({
    example: 'kunle@gmail.com',
    description: 'Account email.',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => trimTransformer(toLowerCaseTransformer(value)))
  email: string;
}

export class ForgotPasswordDTO {
  @ApiProperty({
    example: 'kunle@gmail.com',
    description: 'Account email.',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => trimTransformer(toLowerCaseTransformer(value)))
  email: string;
}

export class ResetPasswordDTO {
  @ApiProperty({
    example: 'Password@123',
    description: 'Account password.',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;

  @ApiProperty({
    example: 'a7c9c7a9-249a-2890-8396-1643b5dbca72',
    description: 'Password reset token.',
  })
  @IsString()
  @IsOptional()
  passwordResetToken: string;

  @ApiProperty({
    example: 29,
    description: 'Account Id.',
  })
  @IsString()
  @IsOptional()
  accountId: string;
}

export class ResetPasswordVerificationDTO {
  @ApiProperty({
    example: 'kunle@gmail.com',
    description: 'Account email.',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => trimTransformer(toLowerCaseTransformer(value)))
  email: string;

  @ApiProperty({
    example: '2938',
    description: 'Password reset token.',
  })
  @IsString()
  otp: string;
}

export class SignupResponsePayload {
  @ApiProperty()
  signupVerificationHash: string;
}

export class SignupVerificationResponsePayload {
  @ApiProperty()
  token: string;
}

export class SigninResponsePayload extends SignupVerificationResponsePayload {}

export class ResetPasswordOTPVerificationResponsePayload {
  @ApiProperty({
    example: '23',
    description: 'Account Id.',
  })
  accountId: string;

  @ApiProperty({
    example: 'Random UUID',
    description: 'Password reset token',
  })
  passwordResetToken: string;
}

export class SigninDTO {
  @ApiProperty({
    example: 'kunle@gmail.com',
    description: 'Account email.',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => trimTransformer(toLowerCaseTransformer(value)))
  email: string;

  @ApiProperty({
    example: 'Password@123',
    description: 'Account password.',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AvailabilityCheckInfo {
  @ApiProperty({ type: Boolean, example: false })
  isAvailable: boolean;
}