import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkshopregistrationDto } from './create-workshopregistration.dto';

export class UpdateWorkshopregistrationDto extends PartialType(CreateWorkshopregistrationDto) {
  /* Inherits all properties from CreateWorkshopregistrationDto but makes them optional */
}