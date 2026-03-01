import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateWorkshopregistrationDto {
  @IsString()
  @IsNotEmpty()
  workshopId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(1)
  slots: number;

  @IsOptional()
  @IsString()
  note?: string;
}