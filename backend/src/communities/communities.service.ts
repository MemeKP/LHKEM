import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community, CommunityDocument } from './schemas/community.schema';
import { Model } from 'mongoose';
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
      // .populate('events')
      // .populate('workshops')
      .exec();
  }

  async findOne(id: string): Promise<Community> {
    const community = await this.communityModel.findById(id)
      // .populate('shops')
      // .populate('events')
      // .populate('workshops')
      .exec();

    if (!community) {
      throw new NotFoundException(`Community with ID ${id} not found`);
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
        throw new NotFoundException(`Product with ID ${id} not found`)
      }
      return { message: `This action removes a #${id} community` };
    } catch (error) {
      throw new InternalServerErrorException('Something wrong during deletion!')
    }

  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

