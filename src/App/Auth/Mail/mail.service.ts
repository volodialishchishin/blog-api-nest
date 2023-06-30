import {transporter} from "./mail.adapter";
import { User } from "../../../Schemas/user.schema";

export class MailService {
  async sendMailConfirmation(user: User, resend:boolean = false,newCode:string='') {
    console.log(user)
    let url = `https://somesite.com/confirm-email?code=${resend?newCode:user.emailConfirmation.confirmationCode}`

    console.log(url)
    let info = await transporter.sendMail({
      from: 'Volodia',
      to: user.accountData.email,
      subject: "Confirm your content",
      text: "Confirm your account",
      html: `<a href=${url}>${url}</a>`
    });

  }
  async sendRecoveryPasswordCode(user: User, resend:boolean = false, newCode:string='') {
    let url = `https://somesite.com/confirm-email?recoveryCode=${newCode}`

    let info = await transporter.sendMail({
      from: 'Volodia',
      to: user.accountData.email,
      subject: "Confirm your content",
      text: "Confirm your account",
      html: `<a href=${url}>${url}</a>`
    });

  }
}
