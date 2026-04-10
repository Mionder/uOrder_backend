// src/modules/tenants/tenants.public.controller.ts
import { Controller, Get, Param, NotFoundException, Body, Post, Req } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Controller('v1/public/menu') // Спеціальний префікс для публічних запитів
export class TenantsPublicController {
  constructor(private prisma: PrismaService) {}

  @Get(':slug')
  async getMenuBySlug(@Param('slug') slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { 
        slug: slug.toLowerCase(),
        isActive: true 
      },
      include: {
        categories: {
          include: {
            items: {
              where: { isActive: true }, // Показуємо тільки активні страви
              orderBy: { sortOrder: 'asc' },
              include: { variants: true },
            }
          }
        }
      }
    });

    if (!tenant) {
      throw new NotFoundException('Restaurant not found');
    }

    return tenant;
  }

      @Post(':slug/view')
      async incrementView(@Param('slug') slug: string) {
        return this.prisma.tenant.update({
          where: { slug },
          data: { views: { increment: 1 } }
        });
      }


  // src/modules/menu/menu.public.controller.ts

@Post(':id/like')
async toggleLike(
  @Param('id') menuItemId: string,
  @Body('identifier') identifier: string, // Приходить з фронта (UUID або Fingerprint)
  @Req() req: any
) {
  const ip = req.ip || req.headers['x-forwarded-for'];

  // Перевіряємо, чи є вже такий лайк
  const existingLike = await this.prisma.like.findUnique({
    where: {
      menuItemId_identifier: { menuItemId, identifier }
    }
  });

  if (existingLike) {
    // Якщо лайк є — видаляємо (дизлайк) і зменшуємо лічильник
    return await this.prisma.$transaction([
      this.prisma.like.delete({ where: { id: existingLike.id } }),
      this.prisma.menuItem.update({
        where: { id: menuItemId },
        data: { likesCount: { decrement: 1 } }
      })
    ]);
  }

  // Якщо лайка немає — створюємо і збільшуємо лічильник
  return await this.prisma.$transaction([
    this.prisma.like.create({
      data: { menuItemId, identifier, ipAddress: ip }
    }),
    this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: { likesCount: { increment: 1 } }
    })
  ]);
}
}