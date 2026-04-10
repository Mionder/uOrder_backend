// src/modules/tenants/tenants.module.ts
import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TenantsPublicController } from './tenants.public.controller';

@Module({
  imports: [CloudinaryModule],
  controllers: [TenantsController, TenantsPublicController],
  providers: [TenantsService],
  exports: [TenantsService], // Експортуємо, якщо захочемо юзати в інших модулях
})
export class TenantsModule {}