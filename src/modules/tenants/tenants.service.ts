// src/modules/tenants/tenants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      // Можна одразу підтягнути кількість страв або категорій для статистики
      include: {
        _count: {
          select: { categories: true, items: true }
        }
      }
    });

    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async getProfileLanguage(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
        where: { id },
        select: {
            languages: true,
        }
    })

    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

async update(id: string, dto: any) {
  return this.prisma.tenant.update({
    where: { id },
    data: {
      name: dto.name,
      slug: dto.slug,
      logo: dto.logo,
      mainColor: dto.mainColor, // Нове поле
      description: dto.description, // Нове поле
      address: dto.address, // Нове поле
      phone: dto.phone, // Нове поле
      workingHours: dto.workingHours, // Нове поле
      isActive: dto.isActive,
      languages: dto.languages
    },
  });
}

async getStats(tenantId: string) {
  // Виконуємо всі підрахунки паралельно для швидкості
  const [itemsCount, categoriesCount, totalLikes, totalViews] = await Promise.all([
    this.prisma.menuItem.count({ 
      where: { tenantId } 
    }),
    this.prisma.category.count({ 
      where: { tenantId } 
    }),
    this.prisma.menuItem.aggregate({
      where: { tenantId },
      _sum: { likesCount: true }
    }),
    this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { views: true } })
  ]);

  return {
    itemsCount,
    categoriesCount,
    totalViews: totalViews?.views || 0,
    totalLikes: totalLikes?._sum?.likesCount || 0
  };
}

}