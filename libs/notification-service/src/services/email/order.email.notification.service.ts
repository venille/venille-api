import { Inject, Injectable } from '@nestjs/common';
import { Account } from 'libs/common/src/models/account.model';
import { AppLogger } from '../../../../common/src/logger/logger.service';
import { EmailSenderService } from 'libs/helper-service/src/services/email-sender.service';
import { admin_order_sanitary_pad_email_html_content } from '../../templates/emails/order/admin_order_sanitary_pad_email_template';
import { customer_order_sanitary_pad_email_html_content } from '../../templates/emails/order/customer_order_sanitary_pad_email_template';

@Injectable()
export class OrderEmailNotificationService {
  constructor(
    private emailSenderService: EmailSenderService,
    @Inject('Logger') private readonly logger: AppLogger,
  ) {}

  async adminOrderSanitaryPadEmailNotification(payload: {
    account: Account;
    quantity: string;
    deliveryMethod: string;
  }) {
    const htmlContent = await admin_order_sanitary_pad_email_html_content({
      quantity: payload.quantity,
      customerEmail: payload.account.email,
      customerPhone: payload.account.phone,
      deliveryMethod: payload.deliveryMethod,
      customerName: payload.account.firstName.concat(
        ' ',
        payload.account.lastName,
      ),
    });

    this.emailSenderService.sendEmail({
      html: htmlContent,
      sub: 'New Sanitary Pad Order',
      to_email: 'support@venille.com.ng',
    });

    this.emailSenderService.sendEmail({
      html: htmlContent,
      sub: 'New Sanitary Pad Order',
      to_email: 'venillepads@gmail.com',
    });
  }

  async customerOrderSanitaryPadEmailNotification(payload: {
    account: Account;
    quantity: string;
    deliveryMethod: string;
  }) {
    const htmlContent = await customer_order_sanitary_pad_email_html_content({
      quantity: payload.quantity,
      deliveryMethod: payload.deliveryMethod,
      customerName: payload.account.firstName,
    });

    return this.emailSenderService.sendEmail({
      html: htmlContent,
      sub: 'Sanitary Pad Order',
      to_email: payload.account.email,
    });
  }
}
