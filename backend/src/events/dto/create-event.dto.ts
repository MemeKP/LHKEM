import { Type, Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  ValidateNested,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { LocationDto } from 'src/communities/dto/location.dto';
import { EventStatus } from '../events.types';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  title_en: string;

  @IsOptional()
  @IsString()
  images?: string[];

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  description_en: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value; 
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsDateString()
  start_at: string;

  @IsDateString()
  end_at: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  seat_limit: number;

  @IsOptional()
  @Type(() => Number) 
  @IsNumber()
  @Min(0)
  deposit_amount?: number;

  @IsEnum(EventStatus)
  status: EventStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  is_pinned?: boolean;
}