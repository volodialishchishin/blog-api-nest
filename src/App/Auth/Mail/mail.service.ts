import { transporter } from './mail.adapter';
import { User } from '../../../Schemas/user.schema';

export class MailService {
  async sendMailConfirmation(user: User, resend = false, newCode = '') {
    const url = `https://somesite.com/confirm-email?code=${
      resend ? newCode : user.emailConfirmation.confirmationCode
    }`;

    const info = await transporter.sendMail({
      from: 'Volodia',
      to: user.accountData.email,
      subject: 'Confirm your content',
      text: 'Confirm your account',
      html: `<a href=${url}>${url}</a>`,
    });
  }
  async sendRecoveryPasswordCode(user: User, resend = false, newCode = '') {
    const url = `https://somesite.com/confirm-email?recoveryCode=${newCode}`;

    const info = await transporter.sendMail({
      from: 'Volodia',
      to: user.accountData.email,
      subject: 'Confirm your content',
      text: 'Confirm your account',
      html: `<a href=${url}>${url}</a>`,
    });
  }
}
