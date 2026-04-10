// src/core/interceptors/tenant.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantStorage } from './tenant.storage';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Дані з JWT
    console.log('INTERCEPTOR FOUND TENANT:', user?.tenantId);

    if (!user || !user.tenantId) {
      throw new UnauthorizedException('Tenant context is missing');
    }

    // Запускаємо весь подальший ланцюжок запиту всередині контексту ALS
    return new Observable((subscriber) => {
      tenantStorage.run({ tenantId: user.tenantId }, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}