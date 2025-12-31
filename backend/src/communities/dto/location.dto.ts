import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CoordinatesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class LocationDto {
  @IsString()
  address: string;

  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  sub_district?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  coordinates: CoordinatesDto;
}
