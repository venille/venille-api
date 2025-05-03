import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { Account } from 'libs/common/src/models/account.model';
import { AppLogger } from '../../../../common/src/logger/logger.service';
import { AccountStatus, AccountType } from 'libs/common/src/constants/enums';
import { reset_password_html_content } from '../../templates/emails/auth/reset_password_email_template';
import { EmailSenderService } from 'libs/helper-service/src/services/email-sender.service';
import { forgot_password_html_content } from '../../templates/emails/auth/forgot_password_email_template';
import { email_verification_html_content } from '../../templates/emails/auth/email_verification_email_template';
import { welcome_customer_email_html_content } from '../../templates/emails/auth/welcome_buyer_email_template';
import { update_account_email_html_content } from '../../templates/emails/auth/update_account_email_template';
import { welcome_seller_email_html_content } from '../../templates/emails/auth/welcome_seller_email_template';

@Injectable()
export class AuthEmailNotificationService {
  constructor(
    public commandBus: CommandBus,
    private configService: ConfigService,
    private emailSenderService: EmailSenderService,
    @Inject('Logger') private readonly logger: AppLogger,
  ) {}

  async verifyNewAccountEmailNotification(account: Account) {
    const htmlContent = await update_account_email_html_content(
      account.firstName,
      account.activationCode,
    );

    return this.emailSenderService.sendEmail({
      html: htmlContent,
      sub: 'Verify New Account Email',
      to_email: account.newEmail,
    });
  }

  async resetPasswordNotification(account: Account) {
    const htmlContent = await reset_password_html_content();

    return this.emailSenderService.sendEmail({
      html: htmlContent,
      sub: 'Password Reset',
      to_email: account.email,
    });
  }

  async forgotPasswordNotification(account: Account) {
    const htmlContent = await forgot_password_html_content(
      account.passwordResetCode,
    );

    return this.emailSenderService.sendEmail({
      html: htmlContent,
      sub: 'Reset Your Password',
      to_email: account.email,
    });
  }

  async newAccountNotifications(account: Account) {
    switch (account.accountType) {
      case AccountType.INDIVIDUAL:
        if (account.status === AccountStatus.ACTIVE) {
          const htmlContent = await welcome_customer_email_html_content(
            account.firstName,
          );

          return this.emailSenderService.sendEmail({
            html: htmlContent,
            sub: 'Welcome to Venille!',
            to_email: account.email,
          });
        } else if (account.status === AccountStatus.PENDING) {
          const htmlContent = await email_verification_html_content(
            account.firstName,
            account.activationCode,
          );

          return this.emailSenderService.sendEmail({
            html: htmlContent,
            sub: 'Email Verification',
            to_email: account.email,
          });
        }
      default:
        return;
    }
  }
}
