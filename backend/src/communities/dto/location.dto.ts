import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class CoordinatesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;
}

export class LocationDto {
  @IsString()
  full_address: string;

  @IsOptional()
  @IsString()
  full_address_en?: string;

  @IsOptional() @IsString() house_no?: string;
  @IsOptional() @IsString() village?: string;
  @IsOptional() @IsString() moo?: string;
  @IsOptional() @IsString() alley?: string;
  @IsOptional() @IsString() road?: string;
  @IsOptional() @IsString() road_en?: string;

  @IsString()
  province: string;
  @IsOptional() @IsString() province_en?: string;

  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() district_en?: string;

  @IsOptional()
  @IsString()
  sub_district?: string;
  
  @IsOptional() 
  @IsString() 
  sub_district_en?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

 @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}
