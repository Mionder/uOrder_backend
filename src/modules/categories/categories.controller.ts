// src/modules/categories/categories.controller.ts
import { Controller, Get, Post, UseGuards, Request, Body, UseInterceptors, Param, Patch, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service'; // Імпортуй сервіс
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { TenantGuard } from '../../core/guards/tenant.guard';
import { TenantInterceptor } from 'src/core/tenant/tenant.interceptor';

@Controller('v1/admin/categories')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
export class CategoriesController {
  // Додаємо конструктор
  constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    create(@Body() dto: any) {
    return this.categoriesService.create(dto);
    }

  @Get()
  findAll(@Request() req) {
    return this.categoriesService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TenantInterceptor)
  async update(
    @Param('id') id: string, 
    @Body() dto: any
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TenantInterceptor)
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return { message: 'Category and all related items deleted successfully' };
  }

  @Get('menu-tree')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TenantInterceptor)
  async getMenuTree() {
    return this.categoriesService.findAllWithItems();
  }

}