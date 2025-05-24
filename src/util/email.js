import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class sendEmail {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `GMS Travels <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // Only production setup
    return nodemailer.createTransport({
      host: 'mail.gmstravels.com',
      port: 465,
      secure: true,
      auth: {
        user: 'developer@gmstravels.com',
        pass: 'p0kxYT%;-6kx',
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      path.join(__dirname, `../views/email/${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    try {
      await this.newTransport().sendMail(mailOptions);
    } catch (err) {
      console.error('❌ Email sending error:', err);
      throw new Error('There was an error sending the email. Try again later!');
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to GMS Travels!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}

export default sendEmail;









