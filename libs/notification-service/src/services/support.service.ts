import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { EmailSenderService } from '../../../helper-service/src/services/email-sender.service';
import { AppLogger } from '../../../common/src/logger/logger.service';
import {
  ContactUsDTO,
  GeotekWaterMonitorContactUsDTO,
  GirlifiedBioContactUsDTO,
} from '../interface';
import { contactUsEmailTemplate } from '../templates/emails/support/contact_us_email_template';
import { girlifiedBioContactUsEmailTemplate } from '../templates/emails/support/girlified_bio_contact_us_email_template';
import { geotekWaterMonitorContactUsEmailTemplate } from '../templates/emails/support/geotek_water_monitor_contact_us_email_template';

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

  async handleGirlifiedBioContactUsService(payload: GirlifiedBioContactUsDTO) {
    try {
      this.logger.log('[SEND-GIRLIFIED-BIO-CONTACT-US-PROCESSING]');

      const emailTemplate = await girlifiedBioContactUsEmailTemplate(
        payload.name,
        payload.email,
        payload.companyOrganization,
        payload.inquiryType,
        payload.message,
      );

      // console.log('PAYLOAD - ', payload);

      this.emailSenderService.sendGirlifiedEmail({
        html: emailTemplate,
        sub: 'Girlified-Bio [GreenSurf] Customer Inquiry',
        to_email: 'info@girlified.com.ng',
      });

      this.logger.log('[SEND-GIRLIFIED-BIO-CONTACT-US-SUCCESS]');
    } catch (error) {
      this.logger.error(`[SEND-GIRLIFIED-BIO-CONTACT-US-FAILED] :: ${error}`);

      throw error;
    }
  }

  async handleGeoTekWaterContactUsService(
    payload: GeotekWaterMonitorContactUsDTO,
  ) {
    try {
      this.logger.log('[SEND-GEOTEK-WATER-CONTACT-US-PROCESSING]');

      const emailTemplate = geotekWaterMonitorContactUsEmailTemplate(
        payload.organizationName,
        payload.projectType,
        payload.surveyTypes,
        payload.latitude,
        payload.longitude,
        payload.additionalNotes,
        payload.urgencyLevel,
        payload.contactName,
        payload.email,
        payload.phoneNumber,
      );

      // console.log('PAYLOAD - ', payload);

      this.emailSenderService.sendGeotekEmail({
        html: emailTemplate,
        sub: 'Geotek Water Monitor - Customer Inquiry',
        to_email: 'geotekwater@gmail.com',
      });

      this.logger.log('[SEND-GEOTEK-WATER-CONTACT-US-SUCCESS]');
    } catch (error) {
      this.logger.error(`[SEND-GEOTEK-WATER-CONTACT-US-FAILED] :: ${error}`);

      throw error;
    }
  }
}
