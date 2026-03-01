import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkshopDto } from './create-workshop.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateWorkshopDto extends PartialType(CreateWorkshopDto) {
  @IsOptional()
  @IsString()
  @IsIn(['OPEN', 'CLOSED', 'FULL', 'CANCELLED'])
  /* Shop Owner action: Used to pause or close registration for clients */
  registrationStatus?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'ACTIVE', 'REJECTED', 'CLOSED'])
  /* Community Admin action: Used to approve or reject the workshop */
  approvalStatus?: string;
}