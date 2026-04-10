// src/modules/cloudinary/cloudinary.provider.ts
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'dmkgdtffx',
      api_key: '769843668196995',
      api_secret: 'BbdNzJP7tibu1Zg0VtHZFn_b-DA',
    });
  },
};