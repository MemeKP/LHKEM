import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CoordinatesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
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

  coordinates: CoordinatesDto;
}
