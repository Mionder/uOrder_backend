// src/modules/tenants/tenants.controller.ts
import { Controller, Get, Post, Patch, Body, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { TenantsService } from './tenants.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantInterceptor } from 'src/core/tenant/tenant.interceptor';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('v1/admin/tenant')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService, private readonly cloudinaryService: CloudinaryService) {}

  @Get('me')
  getProfile(@Req() req: any) {
    return this.tenantsService.findOne(req.user.tenantId);
  }

  @Get('language')
  getProfileLanguage(@Req() req: any) {
    return this.tenantsService.getProfileLanguage(req.user.tenantId);
  }

    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TenantInterceptor)
    getStats(@Req() req: any){
        const tenantId = req.user.tenantId;
        return this.tenantsService.getStats(tenantId);
    }
    

  @Patch('settings')
  updateSettings(@Req() req: any, @Body() dto: any) {
    return this.tenantsService.update(req.user.tenantId, dto);
  }

    @Post('logo')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TenantInterceptor, FileInterceptor('image'))
    async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
    ) {
    // Завантажуємо в папку logos для цього тенента
    const result = await this.cloudinaryService.uploadImage(file, req.user.tenantId);
    
    // Повертаємо URL фронтенду
    return {
        url: result.secure_url,
    };
    }
}