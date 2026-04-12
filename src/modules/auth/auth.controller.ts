// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/register.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { Public } from '@prisma/client/runtime/client';
import { QrService } from '../qr.service';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService, private qrService: QrService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard) // Користувач вже має бути залогінений
  async verify(@Body() body: { code: string }, @Request() req) {
    const userId = req.user.userId || req.user.sub || req.user.id;
  
    console.log('userId -> ', userId);
  if (!userId) {
     throw new UnauthorizedException('User ID not found in token');
  }
    return this.authService.verifyEmail(userId, body.code);
  }

  @Post('resend-code')
  @UseGuards(JwtAuthGuard)
  async resend(@Request() req) {
    //return this.authService.sendVerificationCode(req.user.id, req.user.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: any) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: any) {
    // Після успішного скидання сервіс поверне access_token
    // і юзера одразу залогінить на фронті
    return this.authService.resetPassword(dto);
  }

  @Patch(':id/generate-qr')
  @UseGuards(JwtAuthGuard) // Переконайся, що тільки власник може це робити
  async generateQr(@Param('id') id: string) {
    const url = await this.qrService.generateAndUploadQR(id);
    return { qrCodeUrl: url };
  }

  // Тут буде Login, який повертає JWT
}