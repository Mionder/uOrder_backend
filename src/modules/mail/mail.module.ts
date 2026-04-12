// src/core/mail/mail.module.ts
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Global() // Робимо глобальним, щоб не імпортувати всюди
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}