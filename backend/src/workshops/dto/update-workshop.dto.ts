import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkshopDto } from './create-workshop.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWorkshopDto extends PartialType(CreateWorkshopDto) {
  @IsOptional()
  @IsString()
  /* Optional status update field for PATCH /status endpoint */
  status?: string;
}