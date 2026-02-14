import { Type } from 'class-transformer';
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
  // @IsMongoId()
  // community_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  title_en: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  description_en: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsDateString()
  start_at: string;

  @IsDateString()
  end_at: string;

  @IsNumber()
  @Min(1)
  seat_limit: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit_amount?: number;

  @IsEnum(EventStatus)
  status: EventStatus;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  is_pinned?: boolean;

}
