// src/modules/menu/dto/reorder-menu-item.dto.ts
import { IsArray, IsString, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @IsString()
  id: string;

  @IsInt()
  sortOrder: number;

  @IsString()
  categoryId: string; // Додаємо, якщо страву перенесли в іншу категорію
}

export class ReorderMenuItemsDto {
  @IsArray()
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}