// src/common/dto/localized-field.dto.ts
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class LocalizedFieldDto {
  @IsString()
  @IsNotEmpty()
  uk: string; // Робимо українську обов'язковою для нашого ринку

  @IsOptional()
  @IsString()
  en?: string;

  @IsOptional()
  @IsString()
  pl?: string;
}