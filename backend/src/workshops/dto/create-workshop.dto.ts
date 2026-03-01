import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsIn
} from 'class-validator';

export class CreateWorkshopDto {
  @IsString()
  @IsNotEmpty()
  /* The title of the workshop */
  title: string;

  @IsNumber()
  @Min(0)
  /* Price for participation */
  price: number;

  @IsNumber()
  @Min(1)
  /* Maximum number of participants */
  capacity: number;

  @IsString()
  @IsNotEmpty()
  /* Detailed description of the workshop activity */
  description: string;

  @IsDateString()
  /* Scheduled date for the workshop */
  date: string;

  @IsMongoId()
  @IsNotEmpty()
  /* The ID of the shop hosting the workshop */
  shopId: string;

  @IsMongoId()
  @IsNotEmpty()
  /* The ID of the community the shop belongs to */
  communityId: string;

  @IsOptional()
  @IsString()
  @IsIn(['งานฝีมือ', 'อาหาร', 'ศิลปะ', 'วัฒนธรรม'])
  /* The category of the workshop */
  category?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;

  @IsOptional()
  startTime?: string;

  @IsOptional()
  endTime?: string;

  @IsOptional()
  image?: string;
}