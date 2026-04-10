// src/modules/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

async findAll() {
    // Prisma автоматично додасть WHERE tenantId = "..."
    return this.prisma.tenantClient.category.findMany();
  }
  
async create(dto: any) {
  return this.prisma.tenantClient.category.create({
    data: {
      name: dto.name,
      slug: dto.slug,
      sortOrder: Number(dto.sortOrder) || 0,
      // Ми ОБОВ'ЯЗКОВО маємо передати tenantId тут, 
      // щоб пройти початкову валідацію Prisma Client
    } as any
  });
}

async update(id: string, dto: any) {
  return this.prisma.tenantClient.category.update({
    where: { 
      id: id,
      // tenantId додасться автоматично розширенням!
    },
    data: {
      name: dto.name,
      slug: dto.slug,
      sortOrder: dto.sortOrder !== undefined ? Number(dto.sortOrder) : undefined,
    },
  });
}

async remove(id: string) {
  return this.prisma.tenantClient.category.delete({
    where: { 
      id: id,
      // tenantId додасться автоматично розширенням!
    },
  });
}

async findAllWithItems() {
  return this.prisma.tenantClient.category.findMany({
    // Сортуємо категорії (наприклад, спочатку холодні закуски, потім гаряче)
    orderBy: {
      sortOrder: 'asc',
    },
    include: {
      // Підтягуємо масив страв для кожної категорії
      items: {
        orderBy: {
          sortOrder: 'asc', // Або за ціною/датою
        },
        include: {
          variants: true,
        }
      },
    },
  });
}

}