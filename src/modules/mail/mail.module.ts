// src/modules/mail/mail.module.ts
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        priority: 'high',
        family: 4,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false 
        }
      },
      defaults: {
        from: '"uOrder Team" <uorder.app.menu@gmail.com>',
      },
      template: {
        dir: join(process.cwd(), 'src', 'modules', 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}