import * as nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lishchishin.volodea@gmail.com',
    pass: 'uykbtnrylavksddn',
  },
});
