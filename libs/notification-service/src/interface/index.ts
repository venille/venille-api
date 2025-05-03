import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
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

export interface PromotedSubscriptionReceiptProductInfo {
  name: string;
  imageUrl: string;
}
