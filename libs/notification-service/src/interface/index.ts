import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export interface EmailRequest {
  sender: {
    name: string;
    email: string;
  };
  to: {
    email: string;
  }[];
  subject: string;
  htmlContent: string;
  attachment?: { url?: string; content: string; name: string }[];
}

export interface FCMNotificationPayload {
  title: string;
  body: string;
  data: any;
  iconUrl?: string | null;
  notificationImage?: string | null;
}

export class ContactUsDTO {
  @ApiProperty({
    example: 'Gyang Ibrahim',
    description: 'The name of the user',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'gyangibrahim@yopmail.com',
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Book Appointment Inquiry',
    description: 'The subject of the message',
  })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'I want to book an appointment but I am not sure how to do it.',
    description: 'The message from the user',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}

export class GirlifiedBioContactUsDTO {
  @ApiProperty({
    example: 'Gyang Ibrahim',
    description: 'The name of the user',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'gyangibrahim@yopmail.com',
    description: 'The email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Google Inc',
    description: 'Company/Organization of the sender',
  })
  @IsNotEmpty()
  @IsString()
  companyOrganization: string;

  @ApiProperty({
    example: 'B2B Sales',
    description: 'Type of Inquiry',
  })
  @IsNotEmpty()
  @IsString()
  inquiryType: string;

  @ApiProperty({
    example: 'I want to book an appointment but I am not sure how to do it.',
    description: 'The message from the user',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}

export class GeotekWaterMonitorContactUsDTO {
  @ApiProperty({
    example: 'Acme Corporation',
    description: 'The name of the organization',
  })
  @IsNotEmpty()
  @IsString()
  organizationName: string;

  @ApiProperty({
    example: 'Water Quality Assessment',
    description: 'The type of project',
  })
  @IsNotEmpty()
  @IsString()
  projectType: string;

  @ApiProperty({
    example: ['Environmental Impact', 'Water Quality Testing'],
    description: 'Types of surveys required',
  })
  @IsNotEmpty()
  @IsArray()
  surveyTypes: string[];

  @ApiProperty({
    example: '40.7128',
    description: 'Latitude coordinate',
  })
  @IsNotEmpty()
  @IsString()
  latitude: string;

  @ApiProperty({
    example: '-74.0060',
    description: 'Longitude coordinate',
  })
  @IsNotEmpty()
  @IsString()
  longitude: string;

  @ApiProperty({
    example: 'Additional project requirements and specifications',
    description: 'Additional notes about the project',
  })
  @IsOptional()
  @IsString()
  additionalNotes: string;

  @ApiProperty({
    example: 'High',
    description: 'Urgency level of the request',
  })
  @IsNotEmpty()
  @IsString()
  urgencyLevel: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the contact person',
  })
  @IsNotEmpty()
  @IsString()
  contactName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the contact person',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+1-555-123-4567',
    description: 'Phone number of the contact person',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

export interface PromotedSubscriptionReceiptProductInfo {
  name: string;
  imageUrl: string;
}
