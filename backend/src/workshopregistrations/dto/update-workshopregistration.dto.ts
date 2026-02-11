import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkshopregistrationDto } from './create-workshopregistration.dto';

export class UpdateWorkshopregistrationDto extends PartialType(CreateWorkshopregistrationDto) {}
