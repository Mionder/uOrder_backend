import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { MenuController } from './menu.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}