// src/core/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantStorage } from '../tenant/tenant.storage';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL is not defined in .env file');
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: {
      rejectUnauthorized: false // Це важливо для Supabase
    } });
    const adapter = new PrismaPg(pool);
    
    super({ adapter });
  }

async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to Supabase via Schema ENV');
    } catch (e) {
      console.error('❌ Connection failed:', e);
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Створюємо "розумний" клієнт з розширенням
    readonly tenantClient = this.$extends({
    query: {
        $allModels: {
        async $allOperations({ model, operation, args, query }) {
            const context = tenantStorage.getStore();
            
            if (context?.tenantId) {
            // Приводимо args до any, щоб TS дозволив доступ до динамічних полів
            const anyArgs = args as any;

            // 1. Логіка для ПОШУКУ/ОНОВЛЕННЯ (where)
            if (['findMany', 'findFirst', 'findUnique', 'update', 'delete', 'count'].includes(operation)) {
                anyArgs.where = { 
                ...anyArgs.where, 
                tenantId: context.tenantId 
                };
            }

            if (['create', 'createMany', 'update', 'updateMany'].includes(operation)) {
                const anyArgs = args as any;
                const context = tenantStorage.getStore();

                if (context?.tenantId && anyArgs.data) {
                    // 1. Якщо це поодинока операція (create/update)
                    if (!Array.isArray(anyArgs.data)) {
                    
                    // Використовуємо ТІЛЬКИ об'єктний зв'язок
                    anyArgs.data.tenant = { 
                        connect: { id: context.tenantId } 
                    };

                    // КРИТИЧНО: Видаляємо прямий tenantId з data, щоб не було конфлікту
                    if ('tenantId' in anyArgs.data) {
                        delete anyArgs.data.tenantId;
                    }
                    } 
                    // 2. Якщо це масова операція (createMany/updateMany) - там об'єкти не працюють
                    else {
                    anyArgs.data = anyArgs.data.map(item => {
                        const newItem = { ...item, tenantId: context.tenantId };
                        delete newItem.tenant; // На всякий випадок прибираємо об'єкт
                        return newItem;
                    });
                    }
                }
            }

            // 2. Логіка для СТВОРЕННЯ (data)
                if (['create', 'createMany'].includes(operation)) {
                const anyArgs = args as any;

                if (context?.tenantId) {
                    if (operation === 'create') {
                    // Замість видалення, ми просто підміняємо ID всередині об'єкта connect
                    // Це задовольняє валідатор Prisma на 100%
                    anyArgs.data.tenant = { 
                        connect: { id: context.tenantId } 
                    };
                    } 
                    
                    if (operation === 'createMany') {
                    // Для createMany (якщо будеш юзати) Prisma не підтримує connect,
                    // тому там ми юзаємо прямий tenantId
                    if (Array.isArray(anyArgs.data)) {
                        anyArgs.data = anyArgs.data.map(item => ({
                        ...item,
                        tenantId: context.tenantId
                        }));
                    }
                    }
                }
                }
            }

            return query(args);
        },
        },
    },
    });
}