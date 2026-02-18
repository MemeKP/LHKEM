import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Workshop, WorkshopDocument } from './schemas/workshop.schema';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectModel(Workshop.name)
    private readonly workshopModel: Model<WorkshopDocument>,
  ) {}

  async create(createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
    /* Adds a new workshop to the database */
    const createdWorkshop = new this.workshopModel(createWorkshopDto);
    return createdWorkshop.save();
  }

  async findAll(): Promise<Workshop[]> {
    /* Returns all workshops */
    return this.workshopModel.find().exec();
  }

  async findOne(id: string): Promise<Workshop> {
    /* Finds a workshop by its ID */
    const workshop = await this.workshopModel.findById(id).exec();
    if (!workshop) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }
    return workshop;
  }

  async update(id: string, updateWorkshopDto: UpdateWorkshopDto): Promise<Workshop> {
    /* Updates workshop details */
    const updated = await this.workshopModel
      .findByIdAndUpdate(id, { $set: updateWorkshopDto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string) {
    /* Deletes the workshop */
    const result = await this.workshopModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }
    return { deleted: true };
  }
}