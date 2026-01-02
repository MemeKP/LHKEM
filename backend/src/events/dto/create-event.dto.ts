import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsMongoId,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsMongoId()
  community_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

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
}
