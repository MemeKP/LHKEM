import { Injectable } from '@nestjs/common';
import { CreateWorkshopregistrationDto } from './dto/create-workshopregistration.dto';
import { UpdateWorkshopregistrationDto } from './dto/update-workshopregistration.dto';

@Injectable()
export class WorkshopregistrationsService {
  create(createWorkshopregistrationDto: CreateWorkshopregistrationDto) {
    return 'This action adds a new workshopregistration';
  }

  findAll() {
    return `This action returns all workshopregistrations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workshopregistration`;
  }

  update(id: number, updateWorkshopregistrationDto: UpdateWorkshopregistrationDto) {
    return `This action updates a #${id} workshopregistration`;
  }

  remove(id: number) {
    return `This action removes a #${id} workshopregistration`;
  }
}
