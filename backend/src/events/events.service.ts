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
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) { }

  async create(createEventDto: CreateEventDto, user_id: string, role: 'COMMUNITY_ADMIN', community_id: string): Promise<EventSchema> {

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

  findAll() {
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
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

  async remove(id: number) {
    try {
          const res = await this.eventModel.findByIdAndDelete(id).exec();
          if (!res) {
            throw new NotFoundException(`Event with ID ${id} not found`)
          }
          return { message: `This action removes a #${id} event` };
        } catch (error) {
          throw new InternalServerErrorException('Something wrong during deletion!'+ error)
        }
  }
}
