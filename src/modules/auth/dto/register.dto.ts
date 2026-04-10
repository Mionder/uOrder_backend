// src/modules/auth/dto/register.dto.ts
import { isEmail, IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocalizedFieldDto } from '../../../common/dto/localized-field.dto';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  restaurantSlug: string; // Наприклад, 'pizzanew'

  @ValidateNested()
  @Type(() => LocalizedFieldDto)
  restaurantName: LocalizedFieldDto;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}