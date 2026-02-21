// src/shop/dto/create-shop.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsObject, IsArray } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsOptional()
  @IsString()
  openTime?: string | null;

  @IsOptional()
  @IsString()
  closeTime?: string | null;

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

  @IsString()
  @IsNotEmpty()
  communityId: string;
}
