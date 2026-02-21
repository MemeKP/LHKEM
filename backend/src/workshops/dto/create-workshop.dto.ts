import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
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
}