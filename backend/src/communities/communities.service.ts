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
    await this.fillEnglishFields(createCommunityDto);
    const nameForSlug = createCommunityDto.name_en || createCommunityDto.name;
    const baseSlug = generateSlug(nameForSlug);

    let slug = baseSlug;
    let count = 1;
    while (await this.communityModel.exists({ slug })) {
      slug = `${baseSlug}-${count}`;
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
    if (!dto) return dto;
    const safeTranslate = async (text: string | undefined | null, currentEn: string | undefined | null): Promise<string | undefined> => {
      if (text && typeof text === 'string' && !currentEn) {
        return await this.autoTranslate(text);
      }
      return currentEn ?? undefined;
    };
    if ('name' in dto) dto['name_en'] = await safeTranslate(dto['name'], dto['name_en']);
    if ('history' in dto) dto['history_en'] = await safeTranslate(dto['history'], dto['history_en']);

    if (dto['hero_section']) {
      const hero = dto['hero_section'];
      hero.title_en = await safeTranslate(hero.title, hero.title_en);
      hero.description_en = await safeTranslate(hero.description, hero.description_en);
    }

    if (dto['location']) {
      const loc = dto['location'];
      loc.province_en = await safeTranslate(loc.province, loc.province_en);
      loc.district_en = await safeTranslate(loc.district, loc.district_en);
      loc.sub_district_en = await safeTranslate(loc.sub_district, loc.sub_district_en);
      loc.full_address_en = await safeTranslate(loc.full_address, loc.full_address_en);
    }

    if (dto['cultural_highlights'] && Array.isArray(dto['cultural_highlights'])) {
      for (const item of dto['cultural_highlights']) {
        if (item) {
          item.title_en = await safeTranslate(item.title, item.title_en);
          item.desc_en = await safeTranslate(item.desc, item.desc_en);
        }
      }
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



