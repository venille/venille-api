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
  @ApiPropertyOptional({
    example: '+2348123456789',
    description: 'Phone number of the user.',
  })
  @IsString()
  @IsOptional()
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

export class ClinicalTrialSimulationDTO {
  @ApiProperty({
    example: 'CardioMax Pro',
    description: 'Name of the health product to be tested.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productName: string;

  @ApiProperty({
    example: 'Pharmaceutical Drug',
    description:
      'Type of product being tested (e.g., Pharmaceutical Drug, Medical Device, Supplement).',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  productType: string;

  @ApiProperty({
    example: 'Type 2 Diabetes',
    description: 'The medical condition the product is intended to treat.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  targetCondition: string;

  @ApiProperty({
    example: 'Discovery',
    description: 'The stage of the drug\'s development.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  developmentStage: string;

  @ApiProperty({
    example:
      'A novel oral medication designed to improve glucose control in patients with Type 2 Diabetes. Dosage: 500mg twice daily with meals. Key features include sustained release formulation and minimal side effects.',
    description:
      'Detailed description of the product including intended use, dosage, and key features.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  productDescription?: string;

  @ApiProperty({
    example:
      'Adults aged 18-65, both genders, all ethnicities, global regions, patients with HbA1c 7-10%, no severe renal impairment',
    description:
      'Target demographics for the clinical trial including age range, gender, ethnicity, geographic regions, and comorbidities.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  targetDemographics?: string;

  @ApiProperty({
    example:
      'The product works by inhibiting SGLT2 transporters in the proximal tubule of the kidney, reducing glucose reabsorption and increasing urinary glucose excretion. This mechanism helps lower blood glucose levels independently of insulin secretion.',
    description:
      'Expected mechanism of action - how the product works and what biological pathways it targets.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  mechanismOfAction?: string;

  // @ApiProperty({
  //   example:
  //     'Phase I study in 24 healthy volunteers showed 30% reduction in glucose reabsorption. Preclinical studies in diabetic rats demonstrated 25% improvement in glucose tolerance. Published research on similar SGLT2 inhibitors shows consistent efficacy.',
  //   description:
  //     'Previous studies, preclinical data, pilot studies, or relevant research findings.',
  // })
  // @IsString()
  // @IsOptional()
  // @MaxLength(2000)
  // previousStudies?: string;

  @ApiProperty({
    example:
      'Common side effects include increased urination, urinary tract infections, and genital yeast infections. Contraindicated in patients with severe renal impairment (eGFR <30), diabetic ketoacidosis, or hypersensitivity to the drug. Drug interactions with diuretics and insulin.',
    description:
      'Known risks, side effects, drug interactions, and contraindications.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  knownRisks?: string;
}
