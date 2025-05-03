import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailRequest } from 'libs/notification-service/src/interface';

@Injectable()
export class EmailSenderService {
  constructor(private configService: ConfigService) {}

  async sendEmail(config: {
    from_name?: string;
    from_email?: string;
    to_email: string;
  html: string;
    sub: string;
    attachment?: { url?: string; content: string; name: string }[];
  }): Promise<void> {
    const apiKey = process.env.BREVO_API_KEY;
    const emailRequest: EmailRequest = {
      sender: {
        name: this.configService.get<string>('MAIL_FROM_NAME') ?? 'Livestocx',
        email: this.configService.get<string>('MAIL_FROM_EMAIL'),
      },
      to: [
        {
          email: config.to_email,
        },
      ],
      subject: config.sub,
      htmlContent: config.html,
      attachment: config.attachment,
    };

    try {
      // console.log(
      //   'BREVO_API_KEY : ',
      //   this.configService.get<string>('BREVO_API_KEY'),
      // );

      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        emailRequest,
        {
          headers: {
            accept: 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
          },
        },
      );

      console.log('Email sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}