// src/modules/items/dto/create-item.dto.ts
import { 
  IsNumber, 
  IsUUID, 
  IsUrl, 
  IsBoolean, 
  ValidateNested, 
  IsNotEmpty,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocalizedFieldDto } from '../../../common/dto/localized-field.dto';

export class CreateItemDto {
  @ValidateNested()
  @Type(() => LocalizedFieldDto) // Кажемо class-transformer перетворити вхід на об'єкт
  name: LocalizedFieldDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedFieldDto)
  description?: LocalizedFieldDto;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;
}