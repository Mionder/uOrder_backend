import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/core/prisma/prisma.service";
import { ReorderMenuItemsDto } from "./dto/reorder-menu-item.dto";

// src/modules/menu/menu.service.ts
@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
  // Просто викликаємо findMany(). Prisma Extension сам додасть filter за tenantId!
    return this.prisma.tenantClient.menuItem.findMany({
      include: {
        category: true, // Щоб одразу бачити назву категорії
        variants: true,
      }
    });
  }

  async create(dto: any) {
    return this.prisma.tenantClient.menuItem.create({
      data: {
        name: dto.name,         // Об'єкт { uk: "...", en: "..." }
        basePrice: dto.basePrice,       // Number
        description: dto.description, // Об'єкт або String
        weight: dto.weight,     // String
        image: dto.image,       // String (якщо є)
        category: { 
          connect: { id: dto.categoryId } // Зв'язок з категорією (ID з Postman)
        },
        spiciness: dto.spiciness, // NONE, MEDIUM, HOT
        allergens: dto.allergens, // ['lactose', 'nuts']
        variants: {
          create: dto.variants?.map((v: any) => ({
            label: v.label as any,
            price: v.price
          }))
        },
        tenant: { 
          connect: { id: 'temp-id' } 
        }
        // Додаємо фейковий ID, щоб пройти валідацію
        // Наш Prisma Extension замінить його на реальний UUID з токена
      } as any
    });
  }

  async findAllByCategory(categoryId: string) {
  return this.prisma.tenantClient.menuItem.findMany({
    where: {
      categoryId: categoryId,
      // tenantId додасться автоматично розширенням!
    },
    orderBy: {
      // Можна відсортувати за порядком, якщо додавав таке поле
      name: 'asc' 
    }
  });
}

async update(id: string, dto: any) {
  return this.prisma.tenantClient.menuItem.update({
    where: { 
      id: id,
    },
    data: {
      name: dto.name,
      // price: dto.price, // Якщо ти перейшов на basePrice, це поле можна прибрати
      basePrice: dto.basePrice,
      description: dto.description,
      weight: dto.weight,
      image: dto.image,
      isAvailable: dto.isAvailable ?? false,
      spiciness: dto.spiciness, // NONE, MEDIUM, HOT
      allergens: dto.allergens, // ['lactose', 'nuts']
      
      // КЛЮЧОВИЙ МОМЕНТ ТУТ:
      variants: {
        // 1. Спочатку видаляємо ВСІ існуючі варіанти для цього menuItem
        deleteMany: {}, 
        // 2. Потім створюємо ті, що прийшли з фронтенду
        create: dto.variants?.map((v: any) => ({
          label: v.label as any,
          price: v.price
        })) || []
      },

      category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
      tenant: { connect: { id: 'temp' } }
    } as any,
    // Додай include, щоб повернути страву вже з новими варіантами
    include: {
      variants: true
    }
  });
}

async remove(id: string) {
  return this.prisma.tenantClient.menuItem.delete({
    where: { 
      id: id 
      // tenantId додасться автоматично розширенням
    },
  });
}

async reorderItems(dto: ReorderMenuItemsDto) {
  console.log('reorder_items_DTO',dto);
  // Використовуємо транзакцію для масового оновлення
  return await this.prisma.$transaction(
    dto.items.map((item) =>
      this.prisma.menuItem.update({
        where: { id: item.id },
        data: { 
          sortOrder: item.sortOrder,
          categoryId: item.categoryId // Оновлюємо категорію, якщо вона змінилась
        },
      }),
    ),
  );
}

/* @TODO Update and Add reorder to change sort Index
async reorder(id: string) {
    return this.prisma.tenantClient.menuItem.update({
    where: { 
      id: id,
      // tenantId додасться автоматично розширенням
    },
    data: {
      
      // Обманка для валідатора
      tenant: { connect: { id: 'temp' } }
    } as any
  });
}
*/
async updateViews(slug: string) {
  return this.prisma.tenant.update({
    where: { slug },
    data: { views: { increment: 1 } }
  });
}

}