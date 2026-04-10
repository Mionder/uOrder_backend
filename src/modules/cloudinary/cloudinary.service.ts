// src/modules/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
const toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File, tenantId: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { 
          folder: `uorder/${tenantId}/menu`,
          resource_type: 'auto', // автоматично визначає тип (зображення)
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload result is undefined')); // Фікс помилки TS
          resolve(result);
        },
      );
      
      // Використовуємо streamifier або buffer-to-stream для передачі буфера
      toStream(file.buffer).pipe(upload);
    });
  }
}