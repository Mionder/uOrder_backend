import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MenuModule } from './modules/menu/menu.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [MailModule, AuthModule, PrismaModule, CategoriesModule, MenuModule, TenantsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
