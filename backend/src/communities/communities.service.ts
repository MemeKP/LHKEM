import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community, CommunityDocument } from './schemas/community.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
  ) { }

  async create(createCommunityDto: CreateCommunityDto) {
    const { name } = createCommunityDto;

    const existing = await this.communityModel.findOne({ name });
    if (existing) {
      throw new ConflictException('This community already exist.')
    }
    const baseSlug = generateSlug(name)
    let slug = baseSlug
    let count = 1

    while (await this.communityModel.exists({ slug })) {
      slug = `${baseSlug}-${count}`
      count++;
    }

    const community = new this.communityModel({
      ...createCommunityDto,
      slug,
    })
    return await community.save()
  }

  async findAll(): Promise<Community[]> {
    return this.communityModel.find()
      // .populate('shops')
      .populate('events')
      // .populate('workshops')
      .exec();
  }

  async findOne(id: string): Promise<Community> {
    const community = await this.communityModel.findById(id)
      // .populate('shops')
      .populate('events')
      // .populate('workshops')
      .exec();

    if (!community) {
      throw new NotFoundException(`Community with ID ${id} not found`);
    }

    return community;
  }

  async findByIdOrSlug(identifier: string): Promise<Community> {
    if (Types.ObjectId.isValid(identifier)) {
      const doc = await this.communityModel.findById(identifier).exec();
      if (doc) return doc;
    }
    const decodedSlug = decodeURIComponent(identifier);
    const community = await this.communityModel.findOne({
      $or: [{ slug: decodedSlug }, { name: decodedSlug }]
    }).exec();

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return community;
  }

  update(id: number, updateCommunityDto: UpdateCommunityDto) {
    return `This action updates a #${id} community`;
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const res = await this.communityModel.findByIdAndDelete(id).exec();
      if (!res) {
        throw new NotFoundException(`Community with ID ${id} not found`)
      }
      return { message: `This action removes a #${id} community` };
    } catch (error) {
      throw new InternalServerErrorException('Something wrong during deletion!' + error)
    }
  }

  async getMedia(id: string) {
    try {
      return this.communityModel
        .findById(id)
        .select('images videos')
        .lean()
    } catch (error) {
      throw new NotFoundException('Images or vedios not found' + error)
    }
  }

  async getMapData(id: string) {
    try {
      const community = await this.communityModel
        .findById(id)
        .select('location')
        .populate({
          path: 'workshops',
          select: 'name location',
          options: { limit: 50 }
        })
        .lean();

      if (!community) return null;
      return {
        location: community.location,
        // workshops: community.workshops ?? [],
        shops: [],      // placeholder
        landmarks: []   // placeholder
      };
    } catch (error) {
      throw new NotFoundException('Map not found' + error)
    }
  }

  async getWorkshopsPreview(id: string, limit: number) {
    try {
      return await this.communityModel
        .findById(id)
        .populate({
          path: 'workshops',
          options: { limit: limit, sort: { created_at: -1 } }
        }).exec() || []
    } catch (error) {
      throw new NotFoundException('This community has no workshop' + error)
    }
  }

}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

