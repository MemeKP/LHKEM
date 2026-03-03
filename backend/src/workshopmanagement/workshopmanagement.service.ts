import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workshop, WorkshopDocument } from '../workshops/schemas/workshop.schema';
import { CreateWorkshopDto } from '../workshops/dto/create-workshop.dto';
import { Workshopregistration, WorkshopregistrationDocument } from '../workshopregistrations/schemas/workshopregistration.schema';
import { User, UserDocument } from '../users/schemas/users.schema';
import { Community, CommunityDocument } from '../communities/schemas/community.schema';

const normalizeUserId = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'toString' in value) {
    const str = (value as { toString: () => string }).toString();
    return typeof str === 'string' ? str : null;
  }
  return String(value);
};

@Injectable()
export class WorkshopManagementService {
  constructor(
    @InjectModel(Workshop.name) private readonly workshopModel: Model<WorkshopDocument>,
    @InjectModel(Workshopregistration.name) private readonly registeredWorkshopModel: Model<WorkshopregistrationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Community.name) private readonly communityModel: Model<CommunityDocument>,
  ) {}

  private async shouldAutoApprove(communityRef: any): Promise<boolean> {
    const normalizedId = this.normalizeCommunityId(communityRef);
    if (!normalizedId) return false;

    const community = await this.communityModel
      .findById(normalizedId)
      .select('admin_permissions')
      .lean();

    if (!community) return false;

    return community.admin_permissions?.require_workshop_approval === false;
  }

  private normalizeCommunityId(communityRef: any): string | null {
    if (!communityRef) return null;
    if (typeof communityRef === 'string') return communityRef;
    if (communityRef instanceof Types.ObjectId) return communityRef.toString();
    if (typeof communityRef === 'object' && 'toString' in communityRef) {
      return communityRef.toString();
    }
    return null;
  }

  // Force PENDING status on creation
  async create(createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
    const locationType = createWorkshopDto.locationType === 'custom' ? 'custom' : 'shop';
    const sanitizedCustomLocation = locationType === 'custom' ? createWorkshopDto.customLocation || '' : '';
    const rawEventDate = createWorkshopDto.workshopDate || createWorkshopDto.date;
    const normalizedEventDate = rawEventDate ? new Date(rawEventDate).toISOString() : new Date().toISOString();

    const shouldAutoApprove = await this.shouldAutoApprove(createWorkshopDto.communityId);

    const createdWorkshop = new this.workshopModel({
      ...createWorkshopDto,
      date: normalizedEventDate,
      workshopDate: normalizedEventDate,
      locationType,
      customLocation: sanitizedCustomLocation,
      // CRITICAL FIX: Use the exact new variable names from the schema
      approvalStatus: shouldAutoApprove ? 'ACTIVE' : 'PENDING', 
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
      const registrations = await this.registeredWorkshopModel
        .find(filter)
        .sort({ createdAt: -1 })
        .lean();

      const uniqueUserIds = Array.from(
        new Set(
          registrations
            .map((reg) => normalizeUserId(reg.userId))
            .filter((id): id is string => typeof id === 'string' && !!id)
        )
      );

      const users = await this.userModel
        .find({ user_id: { $in: uniqueUserIds } })
        .select('firstname lastname email phone user_id')
        .lean();

      const userMap = new Map(users.map((user) => [user.user_id, user]));

      return registrations.map((reg) => {
        const normalizedId = normalizeUserId(reg.userId);
        return {
          ...reg,
          fetchedUser: normalizedId ? userMap.get(normalizedId) || null : null,
        };
      });
        
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      // If it throws an ObjectId casting error, it will safely return an empty array
      return []; 
    }
  }

  async updateRegistrationStatus(registrationId: string, status: string) {
    const registration = await this.workshopModel.db.collection('workshopregistrations')
      .findOne({ _id: new Types.ObjectId(registrationId) });

    if (!registration) {
      throw new NotFoundException('Registration record not found');
    }

    const currentStatus = registration.status;
    const slots = registration.slots || 1;

    // อัปเดตสถานะใน collection workshopregistrations
    await this.workshopModel.db.collection('workshopregistrations').updateOne(
      { _id: new Types.ObjectId(registrationId) },
      { $set: { status: status } }
    );

    // ปรับลดยอดที่นั่งตามเงื่อนไขใหม่
    let incQuery: any = {};
    if (status === 'CONFIRMED' && currentStatus === 'PENDING') {
      
      // Add this capacity check before confirming
      const ws = await this.workshopModel.findById(registration.workshopId);
      if (ws) {
        const current = ws.current_participants || 0;
        if (current + slots > ws.capacity) {
          throw new BadRequestException('Cannot confirm: exceeds workshop capacity');
        }
      }

      incQuery = { 
        current_participants: slots,
        pendingRegistrationSeat: -slots 
      };
    } else if (status === 'REJECTED' && currentStatus === 'PENDING') {
      incQuery = { pendingRegistrationSeat: -slots };
    }

    if (Object.keys(incQuery).length > 0) {
      await this.workshopModel.findByIdAndUpdate(
        registration.workshopId,
        { $inc: incQuery }
      );
    }

    return { success: true, newStatus: status };
  }

  async update(id: string, updateData: any): Promise<Workshop> {
    const existingWorkshop = await this.workshopModel.findById(id).exec();
    if (!existingWorkshop) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }

    const shouldAutoApprove = await this.shouldAutoApprove(existingWorkshop.communityId || (existingWorkshop as any).community_id);

    // 1. Check if the incoming update already contains a status change
    // If it doesn't have an approvalStatus, it's a general edit, so we force PENDING.
    if (!updateData.approvalStatus) {
      updateData.approvalStatus = shouldAutoApprove ? 'ACTIVE' : 'PENDING';
    }

    if (typeof updateData.locationType !== 'undefined') {
      updateData.locationType = updateData.locationType === 'custom' ? 'custom' : 'shop';
      updateData.customLocation = updateData.locationType === 'custom' ? updateData.customLocation || '' : '';
    }

    if (typeof updateData.workshopDate !== 'undefined' || typeof updateData.date !== 'undefined') {
      const rawEventDate = updateData.workshopDate || updateData.date;
      if (rawEventDate) {
        const normalizedEventDate = new Date(rawEventDate).toISOString();
        updateData.workshopDate = normalizedEventDate;
        updateData.date = normalizedEventDate;
      } else {
        delete updateData.workshopDate;
      }
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