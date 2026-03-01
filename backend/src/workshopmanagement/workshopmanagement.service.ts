import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workshop, WorkshopDocument } from '../workshops/schemas/workshop.schema';
import { CreateWorkshopDto } from '../workshops/dto/create-workshop.dto';
import { Workshopregistration, WorkshopregistrationDocument } from '../workshopregistrations/schemas/workshopregistration.schema';
// import { UpdateWorkshopDto } from '../workshops/dto/update-workshop.dto';

@Injectable()
export class WorkshopManagementService {
  constructor(
    @InjectModel(Workshop.name) private readonly workshopModel: Model<WorkshopDocument>,
    @InjectModel(Workshopregistration.name) private readonly registeredWorkshopModel: Model<WorkshopregistrationDocument>,
  ) {}

  // Force PENDING status on creation
  async create(createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
    const createdWorkshop = new this.workshopModel({
      ...createWorkshopDto,
      // CRITICAL FIX: Use the exact new variable names from the schema
      approvalStatus: 'PENDING', 
      registrationStatus: 'OPEN',
    });
    return createdWorkshop.save();
  }

  // Get all workshops for a specific shop owner's dashboard
  async findByShopId(shopId: string): Promise<Workshop[]> {
    return this.workshopModel.find({ shopId: shopId }).exec();
  }

  // Get all pending workshops for community admin approval
  async findPending(communityId?: string) {
    try {
      const filter: any = { 
        approvalStatus: { $in: ['PENDING', 'CHANGE', 'REJECTED'] } 
      };

      if (communityId) {
        filter.$or = [
          { communityId: new Types.ObjectId(communityId) },
          { community_id: new Types.ObjectId(communityId) },
          { communityId: communityId }
        ];
      }

      const workshops = await this.workshopModel
        .find(filter)
        .sort({ createdAt: -1 })
        .exec();

      return workshops;

    } catch (error) {
      console.error('BACKEND CRASH IN findPending:', error.message);
      throw new InternalServerErrorException(`Database Error: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Workshop> {
    const workshop = await this.workshopModel.findById(id).exec();
    if (!workshop) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }
    return workshop;
  }

  async findEnrollmentsByWorkshop(workshopId: string) {
    try {
      // 1. Type this as 'any' to stop the TypeScript "overload" error
      const filter: any = { 
        $or: [
          { workshopId: new Types.ObjectId(workshopId) },
          { workshop_id: new Types.ObjectId(workshopId) },
          { workshopId: workshopId } // Fallback just in case it saved as a raw string
        ]
      };

      // 2. Pass the filter and populate the user data
      return await this.registeredWorkshopModel
        .find(filter)
        .populate('userId', 'name email phone') 
        .sort({ createdAt: -1 })
        .exec();
        
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      // If it throws an ObjectId casting error, it will safely return an empty array
      return []; 
    }
  }

  async updateRegistrationStatus(registrationId: string, status: string) {
    // 1. Find the registration using the direct DB connection
    const registration = await this.workshopModel.db.collection('workshopregistrations')
      .findOne({ _id: new Types.ObjectId(registrationId) });

    if (!registration) {
      throw new NotFoundException('Registration record not found');
    }

    // 2. Update the status in the workshopregistrations collection
    await this.workshopModel.db.collection('workshopregistrations').updateOne(
      { _id: new Types.ObjectId(registrationId) },
      { $set: { status: status } }
    );

    // 3. Logic for Issue #3: Only increase seats if the Shop Owner ACCEPTS
    if (status === 'CONFIRMED') {
      await this.workshopModel.findByIdAndUpdate(
        registration.workshopId,
        { $inc: { current_participants: registration.slots || 1 } }
      );
    }

    return { success: true, newStatus: status };
  }

  async update(id: string, updateData: any): Promise<Workshop> {
    // 1. Check if the incoming update already contains a status change
    // If it doesn't have an approvalStatus, it's a general edit, so we force PENDING.
    if (!updateData.approvalStatus) {
      updateData.approvalStatus = 'PENDING';
    }

    // 2. Perform the update in MongoDB
    const updatedWorkshop = await this.workshopModel.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true } // Return the updated document instead of the old one
    ).exec();

    if (!updatedWorkshop) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }

    return updatedWorkshop;
  }

  async updateStatus(id: string, status: string): Promise<Workshop> {
    const updated = await this.workshopModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Workshop not found');
    return updated;
  }

  async remove(id: string) {
    // 1. Validate the ID format to prevent Mongoose casting errors
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Workshop ID format');
    }

    // 2. Delete the Workshop document itself
    const deletedWorkshop = await this.workshopModel.findByIdAndDelete(id).exec();

    if (!deletedWorkshop) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }

    // 3. CLEANUP: Delete all registrations associated with this workshop
    // We use the direct DB connection to target the 'workshopregistrations' collection
    try {
      await this.workshopModel.db.collection('workshopregistrations').deleteMany({
        workshopId: id // Matches the ID of the workshop we just deleted
      });
    } catch (error) {
      console.error(`Cleanup failed for workshop ${id}:`, error);
      // We don't necessarily want to throw an error here because the main 
      // workshop is already gone, but logging it is critical.
    }

    return { 
      success: true, 
      message: 'Workshop and associated registrations deleted successfully' 
    };
  }
}