// src/modules/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Resend } from 'resend';
import { MailService } from '../mail/mail.service';

const resend = new Resend(process.env.RESEND_API_KEY);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, 
    private mailService: MailService,
  ) {}

async register(dto: RegisterDto) {
  // 1. Попередня перевірка (поза транзакцією)
  const existingTenant = await this.prisma.tenant.findUnique({ where: { slug: dto.restaurantSlug } });
  if (existingTenant) throw new ConflictException('Slug already taken');

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  // 2. Транзакція ТІЛЬКИ для БД
  const result = await this.prisma.$transaction(async (tx) => {
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

    // Створюємо код у БД всередині транзакції (це швидко)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await tx.verificationCode.upsert({
      where: { userId: user.id },
      update: { code, expiresAt },
      create: { userId: user.id, code, expiresAt },
    });

    return { user, tenant, code };
  });

  // 3. Відправка пошти ПІСЛЯ транзакції
  // Навіть якщо пошта впаде, юзер вже створений в БД
  await this.mailService.sendVerificationCode(result.user.email, result.code);

  const token = this.generateToken(result.user);
  return { userId: result.user.id, tenantId: result.tenant.id, slug: result.tenant.slug, token };
}

async verifyEmail(userId: string, code: string) {
    const record = await this.prisma.verificationCode.findUnique({ where: { userId } });

    if (!record || record.code !== code) throw new BadRequestException('Невірний код');
    if (new Date() > record.expiresAt) throw new BadRequestException('Термін дії вичерпано');

    await this.prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

    await this.prisma.verificationCode.delete({ where: { userId } });
    return { message: 'Email підтверджено' };
  }

async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { success: true };

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.upsert({
      where: { email },
      update: { token: resetCode, expires },
      create: { email, token: resetCode, expires },
    });

    await this.mailService.sendResetPasswordCode(email, resetCode);
    return { success: true };
  }

  async resetPassword(dto: any) {
    const { email, code, newPassword } = dto;
    const resetEntry = await this.prisma.passwordResetToken.findUnique({ where: { email } });

    if (!resetEntry || resetEntry.token !== code) throw new BadRequestException('Невірний код');
    if (new Date() > resetEntry.expires) throw new BadRequestException('Код прострочено');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { email }, data: { password: hashedPassword } }),
      this.prisma.passwordResetToken.delete({ where: { email } })
    ]);

    const user = await this.prisma.user.findUnique({ where: { email } });
    return this.generateToken(user);
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