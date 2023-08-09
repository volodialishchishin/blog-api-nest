import { User } from '../../../Schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    // помимо всего прочего подключение сервиса отправки
    private readonly mailerService: MailerService,
  ) {}
  async sendMailConfirmation(user: User, resend = false, newCode = '') {
    const url = `https://somesite.com/confirm-email?code=${
      resend ? newCode : user.emailConfirmation.confirmationCode
    }`;

    return await this.mailerService.sendMail({
      from: 'Volodia',
      to: user.accountData.email,
      subject: 'Confirm your content',
      text: 'Confirm your account',
      html: `<a href=${url}>${url}</a>`,
    });
  }
  async sendRecoveryPasswordCode(user: User, resend = false, newCode = '') {
    const url = `https://somesite.com/confirm-email?recoveryCode=${newCode}`;

    return await this.mailerService.sendMail({
      from: 'Volodia',
      to: user.accountData.email,
      subject: 'Confirm your content',
      text: 'Confirm your account',
      html: `<a href=${url}>${url}</a>`,
    });
  }
}
