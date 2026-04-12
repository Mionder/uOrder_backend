// src/core/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendVerificationCode(email: string, code: string) {
    return this.send({
      to: email,
      subject: '🔐 Код підтвердження uOrder',
      html: this.template('Підтвердження пошти', `Ваш код активації:`, code),
    });
  }

  async sendResetPasswordCode(email: string, code: string) {
    return this.send({
      to: email,
      subject: '🔄 Відновлення пароля uOrder',
      html: this.template('Відновлення пароля', `Ви запросили скидання пароля. Використайте цей код:`, code),
    });
  }

  private async send(options: { to: string; subject: string; html: string }) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'uOrder <hello@uorder.app>',
        ...options,
      });
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      console.error('Mail Error:', err);
      // Не кидаємо помилку наверх, щоб не ламати реєстрацію, якщо пошта ляже
    }
  }

  private template(title: string, message: string, code: string) {
    return `
      <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 40px; color: #333;">
        <div style="max-width: 400px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <h1 style="margin: 0 0 20px; font-size: 22px;">uOrder.</h1>
          <h2 style="font-size: 18px; color: #111;">${title}</h2>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">${message}</p>
          <div style="background: #f8f8f8; border-radius: 12px; padding: 20px; margin: 25px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #999;">Код дійсний 15 хвилин.</p>
        </div>
      </div>
    `;
  }
}