import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Model, Types } from 'mongoose';
import { EventDocument, Event as EventSchema } from './schemas/event.schema';
import { InjectModel } from '@nestjs/mongoose';
import { EventStatus } from './events.types';
import { User } from 'src/users/schemas/users.schema';

type ParticipantWithUser = {
  user: Types.ObjectId | User;
  joined_at: Date;
  status: string;
};

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) { }

  async create(createEventDto: CreateEventDto, user_id: string, role: string, community_id: string): Promise<EventSchema> {
    if (createEventDto.end_at < createEventDto.start_at) {
      throw new BadRequestException('End date must be after start date');
    }

    const newEvent = new this.eventModel({
      ...createEventDto,
      community_id: new Types.ObjectId(community_id),
      created_by: new Types.ObjectId(user_id),
      created_by_role: role,
      title: createEventDto.title,
      images: createEventDto.images,
      description: createEventDto.description,
      location: createEventDto.location,
      start_at: new Date(createEventDto.start_at),
      end_at: new Date(createEventDto.end_at),
      seat_limit: createEventDto.seat_limit,
      deposit_amount: createEventDto.deposit_amount ?? 0,
      status: EventStatus.OPEN,
    })
    return newEvent.save();
  }

  async findAll(): Promise<EventSchema[]> {
    return this.eventModel.find();
  }

  async findAllByCommunity(communityId: string) {
    return this.eventModel
      .find({ community_id: new Types.ObjectId(communityId) })
      .sort({ created_at: -1 }) // เรียงจากใหม่ไปเก่า
      .exec();
  }

  async findPending(communityId: string) {
    return this.eventModel.find({
      community_id: communityId,
      status: 'PENDING' // 'DRAFT'
    }).exec();
  }

  async findOne(id: string): Promise<EventSchema> {
    const event = await this.eventModel.findById(id).populate('created_by', 'firstname lastname email').exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<EventSchema> {
    if (updateEventDto.start_at && updateEventDto.end_at) {
      if (updateEventDto.end_at < updateEventDto.start_at) {
        throw new BadRequestException('End date must be after start date');
      }
    }
    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      id,
      { $set: updateEventDto },
      { new: true }
    ).exec();

    if (!updatedEvent) {
      throw new NotFoundException(`Event #${id} not found`);
    }
    return updatedEvent;
  }

  async remove(id: string) {
    try {
      const res = await this.eventModel.findByIdAndDelete(id).exec();
      if (!res) {
        throw new NotFoundException(`Event with ID ${id} not found`)
      }
      return { message: `This action removes a #${id} event` };
    } catch (error) {
      throw new InternalServerErrorException('Something wrong during deletion!' + error)
    }
  }

  async getParticipants(eventId: string) {
    const event = await this.eventModel
      .findById(eventId)
      .populate({
        path: 'participants.user',
        select: 'firstname lastname email phone'
      })
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return (event.participants as ParticipantWithUser[])
      .map(p => {
        if (!p.user || typeof p.user === 'string') return null;

        const user = p.user as User;

        return {
          id: user.user_id,
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          phone: user.phone ?? '-',
          registered_at: p.joined_at,
        };
      })
      .filter(Boolean);
  }

  async joinEvent(eventId: string, userId: string) {
    return this.eventModel.findByIdAndUpdate(
      eventId,
      {
        $push: {
          participants: {
            user: new Types.ObjectId(userId),
            joined_at: new Date()
          }
        }
      },
      { new: true }
    );
  }
}