import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateWorkshopregistrationDto {
  @IsNumber()
  @IsNotEmpty()
  /* The ID of the user registering */
  userId: number;

  @IsNumber()
  @Min(1)
  /* Number of slots requested, must be at least 1 */
  slots: number;

  @IsOptional()
  @IsString()
  /* Additional notes are optional but must be a string if provided */
  note?: string;
}