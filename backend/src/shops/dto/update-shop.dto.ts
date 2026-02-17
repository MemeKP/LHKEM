// src/shop/dto/update-shop.dto.ts
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateShopDto {
  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsOptional()
  openTime?: string;

  @IsString()
  @IsOptional()
  closeTime?: string;

  @IsObject()
  @IsOptional()
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
  };

  @IsObject()
  @IsOptional()
  contact?: {
    line?: string;
    facebook?: string;
    phone?: string;
  };

  @IsArray()
  @IsOptional()
  images?: string[];
}
