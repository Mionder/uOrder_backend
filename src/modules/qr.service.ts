import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async generateAndUploadQR(restaurantId: string) {
    const restaurant = await this.prisma.tenant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) throw new Error('Restaurant not found');

    // 1. Формуємо лінк на публічне меню (фронтенд частина)
    const menuUrl = `https://uorder.app/${restaurant.slug}`;

    // 2. Генеруємо QR-код як Data URI (Base64)
    const qrDataUri = await QRCode.toDataURL(menuUrl, {
      margin: 2,
      scale: 10,
      color: {
        dark: restaurant.mainColor || '#000000',
        light: '#ffffff',
      },
    });

    // 3. Завантажуємо в Cloudinary за твоєю структурою
    // folder: uorder/[restaurant_id]/qr
    const uploadResponse = await cloudinary.uploader.upload(qrDataUri, {
      folder: `uorder/${restaurantId}/qr`,
      public_id: 'restaurant_qr', // фіксована назва, щоб при повторній генерації файл перезаписувався
      overwrite: true,
      resource_type: 'image',
    });

    // 4. Оновлюємо БД посиланням на картинку
    const updatedRestaurant = await this.prisma.tenant.update({
      where: { id: restaurantId },
      data: { qrCodeUrl: uploadResponse.secure_url },
    });

    return updatedRestaurant.qrCodeUrl;
  }
}