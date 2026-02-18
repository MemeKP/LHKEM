import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Model, Types } from 'mongoose';
import { EventDocument, Event as EventSchema } from './schemas/event.schema';
import { InjectModel } from '@nestjs/mongoose';
import { EventStatus } from './events.types';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(EventSchema.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto, user_id: string, role: 'COMMUNITY_ADMIN', community_id: string): Promise<EventSchema> {
    if (new Date(createEventDto.end_at) < new Date(createEventDto.start_at)) {
      throw new BadRequestException('End date must be after start date');
    }

    /** * Used spread operator to maintain efficiency while overriding specific fields 
     */
    const newEvent = new this.eventModel({
      ...createEventDto,
      community_id: new Types.ObjectId(community_id),
      created_by: new Types.ObjectId(user_id),
      created_by_role: role,
      start_at: new Date(createEventDto.start_at),
      end_at: new Date(createEventDto.end_at),
      deposit_amount: createEventDto.deposit_amount ?? 0,
      status: EventStatus.OPEN,
    });
    return newEvent.save();
  }

  async findAll(): Promise<EventSchema[]> {
    return this.eventModel.find().exec();
  }

  async findOne(id: string): Promise<EventSchema> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<EventSchema> {
    /** * Changed parameter type from number to string for ObjectId compatibility 
     */
    if (updateEventDto.start_at && updateEventDto.end_at) {
      if (new Date(updateEventDto.end_at) < new Date(updateEventDto.start_at)) {
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
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      return { message: `This action removes a #${id} event` };
    } catch (error) {
      throw new InternalServerErrorException('Something wrong during deletion! ' + error);
    }
  }
}