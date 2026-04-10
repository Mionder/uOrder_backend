// src/core/tenant/tenant.middleware.ts
import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { tenantStorage } from './tenant.storage';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host; // напр. 'pizzanew.uorder.com'
    
    if(!host) {
        throw new NotFoundException(`Not found host`);
    }

    const subdomain = host.split('.')[0];

    // В ідеалі тут має бути кеш (Redis), щоб не смикати БД на кожен чих
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: subdomain },
      select: { id: true }
    });

    if (!tenant) {
      throw new NotFoundException(`Restaurant "${subdomain}" not found`);
    }

    // Запускаємо контекст запиту з ID ресторану
    tenantStorage.run({ tenantId: tenant.id }, () => next());
  }
}