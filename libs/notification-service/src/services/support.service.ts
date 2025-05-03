import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { EmailSenderService } from '../../../helper-service/src/services/email-sender.service';
import { AppLogger } from '../../../common/src/logger/logger.service';
import { ContactUsDTO } from '../interface';
import { contactUsEmailTemplate } from '../templates/emails/support/contact_us_email_template';

@Injectable()
export class SupportService {
  constructor(
    private configService: ConfigService,
    @Inject('Logger') private readonly logger: AppLogger,
    private readonly emailSenderService: EmailSenderService,
  ) {}

  async handleContactUsService(payload: ContactUsDTO) {
    try {
      this.logger.log('[SEND-CONTACT-US-PROCESSING]');

      const emailTemplate = await contactUsEmailTemplate(
        payload.name,
        payload.email,
        payload.subject,
        payload.message,
      );

      // console.log('PAYLOAD - ', payload);

      this.emailSenderService.sendEmail({
        html: emailTemplate,
        sub: 'Customer Support Inquiry',
        to_email: this.configService.get<string>('CONTACT_US_EMAIL'),
      });

      this.logger.log('[SEND-CONTACT-US-SUCCESS]');
    } catch (error) {
      this.logger.error(`[SEND-CONTACT-US-FAILED] :: ${error}`);

      throw error;
    }
  }
}
