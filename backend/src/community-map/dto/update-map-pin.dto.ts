import { IsNumber, Max, Min } from 'class-validator';

export class UpdateMapPinDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  position_x: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  position_y: number;
}
