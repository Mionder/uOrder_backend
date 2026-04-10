// src/modules/menu/menu.controller.ts
import { Controller, Post, Req, Get, Body, UseGuards, UploadedFile, UseInterceptors, Param, Patch, Delete, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { TenantInterceptor } from 'src/core/tenant/tenant.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ReorderMenuItemsDto } from './dto/reorder-menu-item.dto';

@Controller('v1/admin/menu')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor) // <--- Обов'язково для роботи контексту тенента
export class MenuController {
  constructor(private readonly menuService: MenuService, private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  create(@Body() dto: any) {
    return this.menuService.create(dto);
  }

    @Patch('reorder')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TenantInterceptor)
    async reorder(@Body() dto: ReorderMenuItemsDto) {
      return this.menuService.reorderItems(dto);
    }

    @Get()
    findAll() {
    return this.menuService.findAll();
    }
    

    @Get('category/:categoryId')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TenantInterceptor)
    getByCategory(@Param('categoryId') categoryId: string) {
      return this.menuService.findAllByCategory(categoryId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TenantInterceptor)
    update(@Param('id') id: string, @Body() dto: any) {
      return this.menuService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TenantInterceptor)
    async remove(@Param('id') id: string) {
      await this.menuService.remove(id);
      return { message: 'Menu item deleted successfully' };
    }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image')) // 'image' — це назва поля в FormData
    async uploadFile(@UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
      new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
    ],
  }),) file: Express.Multer.File, @Req() req: any) {
      const tenantId = req.user.tenantId;
      const result = await this.cloudinaryService.uploadImage(file, tenantId);
      return {
        url: result.secure_url,
        public_id: result.public_id, // Це пряме посилання на картинку, яке ми запишемо в базу
      };
    }
}