// src/core/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Робимо модуль глобальним, щоб не імпортувати його всюди вручну
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}