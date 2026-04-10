// src/modules/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, 
    private mailerService: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Перевіряємо чи slug або email вже зайняті
    const existingTenant = await this.prisma.tenant.findUnique({ where: { slug: dto.restaurantSlug } });
    if (existingTenant) throw new ConflictException('Slug already taken');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 2. Виконуємо транзакцію
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug: dto.restaurantSlug,
          name: dto.restaurantName as any,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          tenantId: tenant.id,
          role: 'ADMIN',
        },
      });

      await this.sendVerificationCode(user.id, user.email, tx);
      const token = this.generateToken(user);

      return { userId: user.id, tenantId: tenant.id, slug: tenant.slug, token };
    });
  }

async sendVerificationCode(userId: string, email: string, prismaClient?: any) {
  // Використовуємо переданий tx або основний this.prisma
  const db = prismaClient || this.prisma;

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.verificationCode.upsert({
    where: { userId },
    update: { code, expiresAt },
    create: { userId, code, expiresAt },
  });

  // Відправка листа (це не стосується БД, можна лишати так)
  await this.mailerService.sendMail({
    to: email,
    subject: 'Ваш код підтвердження uOrder',
    template: './verification',
    context: { code },
  });
}

  async verifyEmail(userId: string, code: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    const record = await this.prisma.verificationCode.findUnique({
      where: { userId },
    });

    if (!record || record.code !== code) {
      throw new BadRequestException('Невірний код');
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestException('Термін дії коду вичерпано');
    }

    // Маркуємо користувача як верифікованого
    await this.prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

    // Видаляємо код після успішної перевірки
    await this.prisma.verificationCode.delete({ where: { userId } });

    return { message: 'Email успішно підтверджено' };
  }

async forgotPassword(email: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });
  
  // Безпека: не кажемо прямо, що імейла немає
  if (!user) return { success: true };

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  // Зберігаємо код у PasswordResetToken
  await this.prisma.passwordResetToken.upsert({
    where: { email },
    update: { token: resetCode, expires },
    create: { email, token: resetCode, expires },
  });

  // Використовуємо твій існуючий mailerService
  await this.mailerService.sendMail({
    to: email,
    subject: 'Відновлення пароля uOrder',
    template: './reset-password', // назва твого нового файлу шаблону
    context: { 
      code: resetCode,
      name: user.email || 'Користувач' // можна додати ім'я в шаблон
    },
  });

  return { success: true };
}

async resetPassword(dto: any) {

  const { email, code, newPassword } = dto;

  const resetEntry = await this.prisma.passwordResetToken.findUnique({
    where: { email }
  });

  if (!resetEntry || resetEntry.token !== code) {
    throw new BadRequestException('Невірний код підтвердження');
  }

  if (new Date() > resetEntry.expires) {
    throw new BadRequestException('Термін дії коду вичерпано');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Оновлюємо пароль та чистимо токен
  await this.prisma.$transaction([
    this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    }),
    this.prisma.passwordResetToken.delete({
      where: { email }
    })
  ]);

  // Повертаємо токени, щоб юзер одразу залогінився
  const user = await this.prisma.user.findUnique({ where: { email } });

  if (!user) return;
    
    return;

  //return this.login(user.email, user.password); // Твій стандартний метод логіну, що видає JWT
}



    async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(pass, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
        email: user.email, 
        sub: user.id, 
        tenantId: user.tenantId, // Додаємо в токен
        role: user.role 
    };

      return this.generateToken(user);
    }

    private generateToken(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      tenantId: user.tenantId 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}