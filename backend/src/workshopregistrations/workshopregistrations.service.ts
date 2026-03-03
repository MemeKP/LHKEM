import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateWorkshopregistrationDto } from './dto/create-workshopregistration.dto';
import { UpdateWorkshopregistrationDto } from './dto/update-workshopregistration.dto';
import { Workshopregistration, WorkshopregistrationDocument } from './schemas/workshopregistration.schema';
import { Workshop, WorkshopDocument } from '../workshops/schemas/workshop.schema';
import { Shop, ShopDocument } from '../shops/schemas/shop.schema';

const normalizeId = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'toString' in value) {
    const str = (value as { toString: () => string }).toString();
    return typeof str === 'string' ? str : null;
  }
  return String(value);
};

type WorkshopRegistrationWithWorkshop = Omit<Workshopregistration, 'workshopId'> & {
  workshopId: Workshop | (Workshop & { shop?: Shop | null }) | string;
  workshop?: (Workshop & { shop?: Shop | null }) | null;
};

@Injectable()
export class WorkshopregistrationsService {
  constructor(
    @InjectModel(Workshopregistration.name)
    private readonly workshopregistrationModel: Model<WorkshopregistrationDocument>,
    @InjectModel(Workshop.name)
    private readonly workshopModel: Model<WorkshopDocument>,
    @InjectModel(Shop.name)
    private readonly shopModel: Model<ShopDocument>,
  ) {}

  async create(createWorkshopregistrationDto: CreateWorkshopregistrationDto): Promise<Workshopregistration> {
    const workshopId = normalizeId(createWorkshopregistrationDto.workshopId);
    const workshop = await this.workshopModel.findById(workshopId);
    
    if (workshop) {
      const requestedSlots = createWorkshopregistrationDto.slots || 1;
      const confirmed = workshop.current_participants || 0;
      
      // ตรวจสอบจากที่นั่งที่ยืนยันแล้วเท่านั้น:
      // ลูกค้าสามารถจองได้ตราบที่ confirmed + requested <= capacity
      // (pending ของคนอื่นยังไม่แน่ว่าจะถูก confirm หรือ reject)
      if (confirmed + requestedSlots > workshop.capacity) {
        throw new BadRequestException(`ที่นั่งที่ยืนยันแล้วเต็มแล้ว (${confirmed}/${workshop.capacity}) ไม่สามารถจองเพิ่มได้`);
      }

      await this.workshopModel.findByIdAndUpdate(workshopId, {
        $inc: { pendingRegistrationSeat: requestedSlots }
      });
    }

    const createdRegistration = new this.workshopregistrationModel(createWorkshopregistrationDto);
    return createdRegistration.save();
  }

  private async mapWorkshopsToRegistrations(
    registrations: Workshopregistration[] | WorkshopregistrationDocument[],
  ): Promise<WorkshopRegistrationWithWorkshop[]> {
    if (!registrations.length) {
      return registrations as WorkshopRegistrationWithWorkshop[];
    }

    const workshopIds = Array.from(
      new Set(
        registrations
          .map((reg) => normalizeId(reg.workshopId))
          .filter((id): id is string => typeof id === 'string' && !!id)
      )
    );

    const validObjectIds = workshopIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const workshops = await this.workshopModel
      .find({ _id: { $in: validObjectIds } })
      .lean();

    const shopIds = Array.from(
      new Set(
        workshops
          .map((workshop) => normalizeId(workshop.shopId))
          .filter((id): id is string => typeof id === 'string' && !!id)
      )
    );

    const shops = await this.shopModel
      .find({ _id: { $in: shopIds } })
      .lean();

    const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));

    const workshopMap = new Map(
      workshops.map((workshop) => {
        const shop = normalizeId(workshop.shopId) ? shopMap.get(normalizeId(workshop.shopId) as string) || null : null;
        return [workshop._id.toString(), { ...workshop, shop }];
      })
    );

    return registrations.map((reg) => {
      const normalized = normalizeId(reg.workshopId);
      const enrichedWorkshop = normalized ? workshopMap.get(normalized) || null : null;

      return {
        ...reg,
        workshopId: enrichedWorkshop || reg.workshopId,
        workshop: enrichedWorkshop,
      };
    });
  }

  private async adjustWorkshopParticipants(workshopId: unknown, delta: number) {
    if (!delta) {
      return;
    }

    const normalizedWorkshopId = normalizeId(workshopId);
    if (!normalizedWorkshopId) {
      return;
    }

    await this.workshopModel
      .findByIdAndUpdate(normalizedWorkshopId, { $inc: { current_participants: delta } })
      .exec();

    if (delta < 0) {
      await this.workshopModel
        .updateOne(
          { _id: normalizedWorkshopId, current_participants: { $lt: 0 } },
          { $set: { current_participants: 0 } },
        )
        .exec();
    }
  }

  async findAll(): Promise<WorkshopRegistrationWithWorkshop[]> {
    /* Retrieves all entries from the database */
    const registrations = await this.workshopregistrationModel
      .find()
      .sort({ createdAt: -1 })
      .lean();

    return this.mapWorkshopsToRegistrations(registrations);
  }

  async findByUserId(userId: string): Promise<WorkshopRegistrationWithWorkshop[]> {
    if (!userId) {
      return [];
    }

    const registrations = await this.workshopregistrationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return this.mapWorkshopsToRegistrations(registrations);
  }

  async findOne(id: string): Promise<WorkshopRegistrationWithWorkshop> {
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

  async cancel(id: string): Promise<Workshopregistration> {
    const registration = await this.workshopregistrationModel.findById(id).exec();
    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    const currentStatus = (registration.status || '').toUpperCase();
    const alreadyCancelled = ['CANCEL', 'CANCELLED'].includes(currentStatus);
    if (alreadyCancelled) {
      return registration;
    }

    const updated = await this.workshopregistrationModel
      .findByIdAndUpdate(id, { $set: { status: 'CANCEL' } }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    const reservedStatuses = ['CONFIRMED', 'ACTIVE', 'COMPLETED'];
    const seatsToRelease = registration.slots || 1;

    if (reservedStatuses.includes(currentStatus)) {
      await this.adjustWorkshopParticipants(registration.workshopId, -seatsToRelease);
    } else if (currentStatus === 'PENDING') {
      await this.workshopModel.findByIdAndUpdate(registration.workshopId, {
        $inc: { pendingRegistrationSeat: -seatsToRelease }
      });
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