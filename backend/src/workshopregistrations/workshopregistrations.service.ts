import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWorkshopregistrationDto } from './dto/create-workshopregistration.dto';
import { UpdateWorkshopregistrationDto } from './dto/update-workshopregistration.dto';
import { Workshopregistration, WorkshopregistrationDocument } from './schemas/workshopregistration.schema';

@Injectable()
export class WorkshopregistrationsService {
  constructor(
    @InjectModel(Workshopregistration.name)
    private readonly workshopregistrationModel: Model<WorkshopregistrationDocument>,
  ) {}

  async create(createWorkshopregistrationDto: CreateWorkshopregistrationDto): Promise<Workshopregistration> {
    /* Inserts a real entry into the database */
    const createdRegistration = new this.workshopregistrationModel(createWorkshopregistrationDto);
    return createdRegistration.save();
  }

  async findAll(): Promise<Workshopregistration[]> {
    /* Retrieves all entries from the database */
    return this.workshopregistrationModel.find().exec();
  }

  async findOne(id: string): Promise<Workshopregistration> {
    /* Fetches one entry by MongoDB ID */
    const registration = await this.workshopregistrationModel.findById(id).exec();
    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }
    return registration;
  }

  async update(id: string, updateWorkshopregistrationDto: UpdateWorkshopregistrationDto): Promise<Workshopregistration> {
    /* Edits an existing entry */
    const updated = await this.workshopregistrationModel
      .findByIdAndUpdate(id, { $set: updateWorkshopregistrationDto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string) {
    /* Deletes an entry from the database */
    const result = await this.workshopregistrationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }
    return { deleted: true };
  }
}