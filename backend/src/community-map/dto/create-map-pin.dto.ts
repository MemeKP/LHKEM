import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PinType } from '../schemas/map-pin.schema';

export class CreateMapPinDto {
  @IsEnum(PinType)
  type: PinType;

  @IsMongoId()
  ref_id: string;

  @IsString()
  label: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  position_x: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  position_y: number;
}
