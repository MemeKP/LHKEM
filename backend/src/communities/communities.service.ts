import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community, CommunityDocument } from './schemas/community.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { translate } from 'google-translate-api-x';

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

    if (createCommunityDto.name && createCommunityDto.name_en) {
      createCommunityDto.name_en = await this.autoTranslate(createCommunityDto.name)
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

  async update(id: string, updateCommunityDto: UpdateCommunityDto) {
    const finalDto = await this.fillEnglishFields(updateCommunityDto);
    const updatedCommunity = await this.communityModel.findByIdAndUpdate(
      id,
      finalDto,
      { new: true, runValidators: true }
    );
    if (!updatedCommunity) {
      throw new NotFoundException(`Community #${id} not found`);
    }
    return updatedCommunity;
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
        shops: [],
        landmarks: []
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

  private async autoTranslate(text: string): Promise<string> {
    if (!text) return '';
    try {
      // แปลจากไทยไปอิ้ง
      const res = await translate(text, { from: 'th', to: 'en' });
      return res.text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // ถ้าแปลพังให้คืนค่าเดิมกลับไป (ดีกว่าค่าว่าง)
    }
  }

  private async fillEnglishFields<T extends CreateCommunityDto | UpdateCommunityDto>(dto: T): Promise<T> {
    if (dto.name && !dto.name_en) dto.name_en = await this.autoTranslate(dto.name);
    if (dto.history && !dto.history_en) dto.history_en = await this.autoTranslate(dto.history);

    if (dto.hero_section) {
      if (dto.hero_section.title && !dto.hero_section.title_en) {
        dto.hero_section.title_en = await this.autoTranslate(dto.hero_section.title);
      }
      if (dto.hero_section.description && !dto.hero_section.description_en) {
        dto.hero_section.description_en = await this.autoTranslate(dto.hero_section.description);
      }
    }

    if (dto.location) {
      const loc = dto.location;
      if (loc.province && !loc.province_en) loc.province_en = await this.autoTranslate(loc.province);
      if (loc.district && !loc.district_en) loc.district_en = await this.autoTranslate(loc.district);
      if (loc.sub_district && !loc.sub_district_en) loc.sub_district_en = await this.autoTranslate(loc.sub_district);
      if (loc.road && !loc.road_en) loc.road_en = await this.autoTranslate(loc.road);
      if (loc.full_address && !loc.full_address_en) loc.full_address_en = await this.autoTranslate(loc.full_address);
    }

    if (dto.cultural_highlights && Array.isArray(dto.cultural_highlights)) {
      dto.cultural_highlights = await Promise.all(
        dto.cultural_highlights.map(async (item) => {
          if (item.title && !item.title_en) item.title_en = await this.autoTranslate(item.title);
          if (item.desc && !item.desc_en) item.desc_en = await this.autoTranslate(item.desc);
          return item;
        })
      );
    }
    return dto;
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



