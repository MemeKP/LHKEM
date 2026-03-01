import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workshop, WorkshopDocument } from './schemas/workshop.schema';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectModel(Workshop.name) private readonly workshopModel: Model<WorkshopDocument>,
  ) {}

  // PUBLIC: Fetch only approved and active workshops
  async findAllActive(): Promise<Workshop[]> {
  return this.workshopModel.find({ 
    approvalStatus: 'ACTIVE', 
    registrationStatus: 'OPEN' 
  }).exec();
}

  // PUBLIC: Fetch details of a specific workshop
  async findOne(id: string): Promise<Workshop> {
    const workshop = await this.workshopModel.findById(id).exec();
    if (!workshop) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }
    // Optional: You could add a check here to ensure clients can't fetch a PENDING workshop by ID
    return workshop;
  }

  async incrementView(id: string) {
    const updatedWorkshop = await this.workshopModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).exec();

    if (!updatedWorkshop) {
      throw new NotFoundException(`Workshop not found`);
    }

    return updatedWorkshop;
  }
}