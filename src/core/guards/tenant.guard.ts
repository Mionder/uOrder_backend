// src/core/guards/tenant.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { tenantStorage } from '../tenant/tenant.storage';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Дані з JWT
    const currentTenant = tenantStorage.getStore(); // Дані з Middleware (по піддомену)

    if (!user || !currentTenant) return false;

    // Перевірка: чи належить цей користувач до цього закладу?
    if (user.tenantId !== currentTenant.tenantId) {
      throw new ForbiddenException('You do not have access to this restaurant');
    }

    return true;
  }
}