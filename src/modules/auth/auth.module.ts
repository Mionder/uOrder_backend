// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../../core/prisma/prisma.service';
import { QrService } from '../qr.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Додай це в .env
      signOptions: { expiresIn: '7d' }, // Токен на тиждень
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, QrService, JwtStrategy, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}