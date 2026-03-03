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

    const perms = community.admin_permissions;
    if (!perms) return false;

    // require_workshop_approval = false → ไม่ต้องรออนุมัติ → auto-approve
    // require_workshop_approval = true  → ต้องรออนุมัติ → ไม่ auto-approve
    // Default ของ schema คือ false (ไม่ต้องอนุมัติ) ดังนั้น:
    // - ถ้า field ยังไม่ได้ตั้ง → default เป็น false = ไม่ auto-approve ไว้ก่อน (safe default)
    // - ถ้า require_workshop_approval = false อย่างชัดเจน → auto-approve
    if (typeof perms.require_workshop_approval === 'boolean') {
      return perms.require_workshop_approval === false;
    }

    // ถ้าไม่มี field นี้ในเอกสาร → ต้องรออนุมัติ (safe default)
    return false;
  }

  private normalizeCommunityId(communityRef: any): string | null {
    if (!communityRef) return null;
    if (typeof communityRef === 'string') return communityRef;
    if (communityRef instanceof Types.ObjectId) return communityRef.toString();
    if (typeof communityRef === 'object') {
      if (communityRef._id) return communityRef._id.toString();
      if (communityRef.id) return communityRef.id.toString();
      if (typeof communityRef.toString === 'function') {
        const str = communityRef.toString();
        if (str !== '[object Object]') return str;
      }
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

    const currentStatus = String(registration.status || '').toUpperCase();
    const newStatus = status.toUpperCase();
    const slots = Number(registration.slots || 1);

    // Normalize workshopId to ObjectId
    let workshopObjectId: Types.ObjectId | null = null;
    try {
      const rawId = registration.workshopId;
      if (rawId instanceof Types.ObjectId) {
        workshopObjectId = rawId;
      } else if (typeof rawId === 'string' && Types.ObjectId.isValid(rawId)) {
        workshopObjectId = new Types.ObjectId(rawId);
      } else if (rawId && typeof rawId === 'object' && rawId.toString) {
        const str = rawId.toString();
        if (Types.ObjectId.isValid(str)) {
          workshopObjectId = new Types.ObjectId(str);
        }
      }
    } catch (e) {
      console.error('Cannot parse workshopId:', registration.workshopId);
    }

    const workshopsCollection = this.workshopModel.db.collection('workshops');

    // =========================================================
    // ตรวจสอบก่อน CONFIRM เพื่อป้องกัน overbooking
    // =========================================================
    if (newStatus === 'CONFIRMED' && currentStatus === 'PENDING') {
      if (!workshopObjectId) {
        throw new NotFoundException(`Cannot find workshop – invalid workshopId on registration`);
      }

      const ws = await workshopsCollection.findOne({ _id: workshopObjectId });
      if (!ws) {
        throw new NotFoundException(`Workshop ${registration.workshopId} not found`);
      }

      const confirmed = Number(ws.current_participants || 0);
      if (confirmed + slots > ws.capacity) {
        throw new BadRequestException(
          `ไม่สามารถยืนยันได้: ที่นั่งที่ยืนยันแล้วเต็ม (${confirmed}/${ws.capacity}) กรุณา Reject รายการบางรายการก่อน`
        );
      }

      // อัปเดตสถานะ registration ก่อน
      await this.workshopModel.db.collection('workshopregistrations').updateOne(
        { _id: new Types.ObjectId(registrationId) },
        { $set: { status: 'CONFIRMED' } }
      );

      // อัปเดต workshop counters ด้วย pipeline (กัน pendingRegistrationSeat ติดลบ)
      await workshopsCollection.updateOne(
        { _id: workshopObjectId },
        [
          {
            $set: {
              current_participants: { $add: ['$current_participants', slots] },
              pendingRegistrationSeat: {
                $max: [0, { $subtract: ['$pendingRegistrationSeat', slots] }]
              }
            }
          }
        ]
      );

      return { success: true, newStatus: 'CONFIRMED' };
    }

    // =========================================================
    // REJECT: คืน pending seat, กัน pendingRegistrationSeat ติดลบ
    // =========================================================
    if (newStatus === 'REJECTED' && currentStatus === 'PENDING') {
      await this.workshopModel.db.collection('workshopregistrations').updateOne(
        { _id: new Types.ObjectId(registrationId) },
        { $set: { status: 'REJECTED' } }
      );

      if (workshopObjectId) {
        await workshopsCollection.updateOne(
          { _id: workshopObjectId },
          [
            {
              $set: {
                pendingRegistrationSeat: {
                  $max: [0, { $subtract: ['$pendingRegistrationSeat', slots] }]
                }
              }
            }
          ]
        );
      }

      return { success: true, newStatus: 'REJECTED' };
    }

    // =========================================================
    // สำหรับ status อื่นๆ (เช่น CANCEL จาก shop owner)
    // =========================================================
    await this.workshopModel.db.collection('workshopregistrations').updateOne(
      { _id: new Types.ObjectId(registrationId) },
      { $set: { status: status } }
    );

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