// src/community-map/dto/create-map-pin.dto.ts
import { IsNumber, Max, Min } from 'class-validator';

export class CreateMapPinDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  position_x: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  position_y: number;
}
