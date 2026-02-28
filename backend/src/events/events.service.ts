import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Model, Types } from 'mongoose';
import { EventDocument, Event as EventSchema } from './schemas/event.schema';
import { InjectModel } from '@nestjs/mongoose';
import { EventStatus } from './events.types';
import { User } from 'src/users/schemas/users.schema';
import { Community, CommunityDocument } from 'src/communities/schemas/community.schema';

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
    @InjectModel(Community.name)
    private readonly communityModel: Model<CommunityDocument>,
  ) { }

  async create(
    createEventDto: CreateEventDto,
    user_id: string,
    role: string,
    community_id: string
  ): Promise<EventDocument> {

    if (new Date(createEventDto.end_at) < new Date(createEventDto.start_at)) {
      throw new BadRequestException('End date must be after start date');
    }

    const newEvent = new this.eventModel({
      ...createEventDto,
      community_id: new Types.ObjectId(community_id),
      created_by: new Types.ObjectId(user_id),
      created_by_role: role,

      start_at: new Date(createEventDto.start_at),
      end_at: new Date(createEventDto.end_at),

      deposit_amount: createEventDto.deposit_amount ?? 0,
      images: createEventDto.images ?? [],
      status: createEventDto.status ?? EventStatus.PENDING,
    });

    return newEvent.save();
  }

  async findPending(communityId: string): Promise<EventDocument[]> {
    return this.eventModel
      .find({ community_id: new Types.ObjectId(communityId), status: EventStatus.PENDING })
      .sort({ created_at: -1 })
      .exec();
  }

  async findAllByCommunity(communityId: string) {
    return this.eventModel
      .find({ community_id: new Types.ObjectId(communityId) })
      .sort({ created_at: -1 })
      .exec();
  }

  async findAllByCommunities(communityIds: string[]) {
    const objectIds = communityIds.map(id => new Types.ObjectId(id));
    return this.eventModel
      .find({
        community_id: { $in: objectIds }
      })
      .sort({ created_at: -1 })
      .populate('created_by', 'firstname lastname email')
      .exec();
  }

  private async findCommunityByIdentifier(identifier: string) {
    if (Types.ObjectId.isValid(identifier)) {
      const byId = await this.communityModel.findOne({
        _id: new Types.ObjectId(identifier),
        is_active: true,
      }).exec();
      if (byId) return byId;
    }

    const decoded = decodeURIComponent(identifier);
    return this.communityModel.findOne({
      $or: [{ slug: decoded }, { name: decoded }],
      is_active: true,
    }).exec();
  }

  async findPublicByCommunity(identifier: string, status?: string) {
    const community = await this.findCommunityByIdentifier(identifier);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const statuses = (status ? status.split(',') : [EventStatus.OPEN])
      .map((s) => s?.trim()?.toUpperCase())
      .filter((s): s is EventStatus => Object.values(EventStatus).includes(s as EventStatus));

    const statusFilter = statuses.length > 0 ? statuses : [EventStatus.OPEN];

    return this.eventModel
      .find({
        community_id: community._id,
        status: { $in: statusFilter },
      })
      .sort({ start_at: 1 })
      .exec();
  }

  async findPublicEventDetail(identifier: string, eventId: string) {
    const community = await this.findCommunityByIdentifier(identifier);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Event not found');
    }

    const event = await this.eventModel.findOne({
      _id: new Types.ObjectId(eventId),
      community_id: community._id,
    }).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findOne(id: string): Promise<EventSchema> {
    const event = await this.eventModel.findById(id).populate('created_by', 'firstname lastname email').exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    image?: Express.Multer.File,
  ): Promise<EventSchema> {

    if (updateEventDto.start_at && updateEventDto.end_at) {
      if (updateEventDto.end_at < updateEventDto.start_at) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    if (updateEventDto.location && typeof updateEventDto.location === 'string') {
      updateEventDto.location = JSON.parse(updateEventDto.location);
    }

    if (updateEventDto.contact && typeof updateEventDto.contact === 'string') {
      try {
        updateEventDto.contact = JSON.parse(updateEventDto.contact);
      } catch (error) {
        throw new BadRequestException('Invalid contact format');
      }
    }

    if (image) {
      const existingEvent = await this.eventModel.findById(id);

      updateEventDto.existing_images = [
        ...(existingEvent?.images || []),
        `/uploads/events/${image.filename}`,
      ];
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