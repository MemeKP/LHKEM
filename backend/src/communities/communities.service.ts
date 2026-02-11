import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community, CommunityDocument } from './schemas/community.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { translate } from 'google-translate-api-x';
import { ChartResponse, MonthlyStat, ParticipantsResult, RevenueResult } from './dto/types.dto';
import { Workshop } from 'src/workshops/schemas/workshop.schema';
import { Shop } from 'src/shops/schemas/shop.schema';
import { Workshopregistration } from 'src/workshopregistrations/schemas/workshopregistration.schema';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
    @InjectModel(Workshop.name) private workshopModel: Model<Workshop>,
    @InjectModel(Shop.name) private shopModel: Model<Shop>,
    @InjectModel(Workshopregistration.name) private registrationModel: Model<Workshopregistration>,
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

  async getDashboardStats(id: string) {
    const community = await this.communityModel.findById(id);
    if (!community) throw new NotFoundException('Community not found');
    const communityId = community._id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const workshops = await this.workshopModel.find({ community: communityId }).select('_id');
    const workshopIds = workshops.map(w => w._id);

    const [
      totalShops,
      totalWorkshops,
      pendingApprovals,
      participantsAgg,
      revenueAgg
    ] = await Promise.all([
      this.shopModel.countDocuments({ community: communityId }),
      this.workshopModel.countDocuments({ community: communityId }),
      this.workshopModel.countDocuments({ community: communityId, status: 'pending' }),

      this.registrationModel.aggregate<ParticipantsResult>([
        {
          $match: {
            workshop: { $in: workshopIds },
            status: { $in: ['confirmed', 'completed'] }
          }
        },
        {
          $group: {
            _id: null,
            totalParticipants: { $sum: 1 }
          }
        }
      ]),

      this.registrationModel.aggregate<RevenueResult>([
        {
          $match: {
            workshop: { $in: workshopIds },
            status: { $in: ['paid', 'completed', 'confirmed'] },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ]),
    ]);
    const totalParticipants = participantsAgg.length > 0 ? participantsAgg[0].totalParticipants : 0;
    const monthlyRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
    return {
      totalShops,
      totalWorkshops,
      pendingApprovals,
      totalParticipants,
      monthlyRevenue
    };
  }

  public async autoTranslate(text: string): Promise<string> {
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

  async getShops(id: string) {
    const community = await this.communityModel.findById(id);
    if (!community) throw new NotFoundException('Community not found');

    const shops = await this.shopModel
      .find({ community: community._id }) //!!!!! schema ของ shop กับ workshop ยังไม่มี
      .sort({ createdAt: -1 })
      .exec();

    return shops;
  }

  async getChartStats(id: string): Promise<ChartResponse> {
    const community = await this.communityModel.findById(id)
    if (!community) throw new NotFoundException('Community not found');

    const workshops = await this.workshopModel.find({ community: community._id }).select('_id'); // !!!!!
    const workshopIds = workshops.map(w => w._id);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const stats = await this.registrationModel.aggregate<MonthlyStat>([
      {
        $match: {
          workshop: { $in: workshopIds },
          status: { $in: ['confirmed', 'completed', 'paid'] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
          participants: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formattedRevenue: { name: string; value: number }[] = [];
    const formattedParticipants: { name: string; value: number }[] = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i)); // ไล่จากอดีต -> ปัจจุบัน
      const monthIndex = d.getMonth() + 1; // 1-12
      const monthName = monthNames[d.getMonth()]; 

      const foundStat = stats.find(s => s._id === monthIndex);

      formattedRevenue.push({
        name: monthName,
        value: foundStat ? foundStat.revenue : 0
      });

      formattedParticipants.push({
        name: monthName,
        value: foundStat ? foundStat.participants : 0
      });
    }

    return {
      revenueByMonth: formattedRevenue,
      participantsByMonth: formattedParticipants
    };
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



