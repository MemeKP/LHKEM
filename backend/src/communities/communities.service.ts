import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
import { CommunityAdmin } from 'src/community-admin/schemas/community-admin.schema';
import { LocationDto } from './dto/location.dto';
import { User } from 'src/users/schemas/users.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
import { CommunityView } from 'src/community-view/schemas/community-view.schema';
import * as path from 'path';
import { promises as fsPromises } from 'fs';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
    @InjectModel(Workshop.name) private workshopModel: Model<Workshop>,
    @InjectModel(Shop.name) private shopModel: Model<Shop>,
    @InjectModel(Workshopregistration.name) private registrationModel: Model<Workshopregistration>,
    @InjectModel(CommunityAdmin.name) private communityadminModel: Model<CommunityAdmin>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CommunityView.name) private communityViewModel: Model<CommunityView>,

  ) { }

  async create(userId: string, createCommunityDto: CreateCommunityDto) {
    const { name } = createCommunityDto;
    const existing = await this.communityModel.findOne({ name });
    if (existing) {
      throw new ConflictException('This community already exists.');
    }
    let locData: any = createCommunityDto.location;
    if (typeof locData === 'string') {
      try { locData = JSON.parse(locData); } catch (e) { }
    }
    const formattedLocation = {
      ...locData,
      coordinates: locData?.coordinates
        ? {
          lat: locData.coordinates.lat != null
            ? Number(locData.coordinates.lat)
            : undefined,
          lng: locData.coordinates.lng != null
            ? Number(locData.coordinates.lng)
            : undefined,
        }
        : undefined,
    };

    let contactData: any = createCommunityDto.contact_info;
    if (typeof contactData === 'string') {
      try { contactData = JSON.parse(contactData); } catch (e) { contactData = {}; }
    }

    let heroData: any = createCommunityDto.hero_section;
    if (typeof heroData === 'string') {
      try {
        heroData = JSON.parse(heroData)
      } catch (e) {
        heroData = {}
      }
    }

    let highlights = createCommunityDto.cultural_highlights;

    // หน้าบ้านตอนนี้ไม่มีให้เก็บจาก user ใช้ default ไปก่อน
    if (!highlights || highlights.length === 0) {
      highlights = [
        {
          title: "เป็นมิตรกับสิ่งแวดล้อม",
          title_en: "Environmentally Friendly",
          desc: "รักษาธรรมชาติอย่างยั่งยืน",
          desc_en: "Preserve nature sustainably"
        },
        {
          title: "สืบสานวัฒนธรรม",
          title_en: "Cultural Heritage",
          desc: "เรียนรู้จากช่างฝีมือท้องถิ่น",
          desc_en: "Learn from local artisans"
        },
        {
          title: "ชุมชนเข้มแข็ง",
          title_en: "Strong Community",
          desc: "รายได้ 100% กลับสู่ผู้ประกอบการในชุมชน",
          desc_en: "100% of income goes to local entrepreneurs"
        },
        {
          title: "Slow Life",
          title_en: "Slow Life",
          desc: "หยุดพัก ผ่อนคลายและใช้เวลากับสิ่งที่รัก",
          desc_en: "Relax and spend time doing what you love"
        }
      ];
    }

    const dataToSave: any = {
      ...createCommunityDto,
      location: formattedLocation,
      contact_info: contactData,
      hero_section: heroData,
      cultural_highlights: highlights,
    };

    await this.fillEnglishFields(dataToSave);

    dataToSave.location = {
      ...formattedLocation,
      ...dataToSave.location
    };

    const nameForSlug = dataToSave.name_en || dataToSave.name;
    const baseSlug = generateSlug(nameForSlug);
    let slug = baseSlug;
    let count = 1;
    while (await this.communityModel.exists({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const community = new this.communityModel({
      ...dataToSave,
      slug,
    });

    // console.log('FINAL DATA BEFORE SAVE:', community);

    const savedCommunity = await community.save();

    // console.log('--- START ADMIN ASSIGNMENT ---');
    // console.log('1. Raw DTO Admins:', createCommunityDto.admins);

    let adminsList: any = createCommunityDto.admins;
    if (typeof adminsList === 'string') {
      try { adminsList = JSON.parse(adminsList); } catch (e) { adminsList = []; }
    }
    if (Array.isArray(adminsList) && adminsList.length > 0) {
      const users = await this.userModel.find({
        email: { $in: adminsList }
      }).select('_id email role');

      let adminPermissions: any = {};
      if (createCommunityDto['admin_permissions']) {
        try { adminPermissions = JSON.parse(createCommunityDto['admin_permissions']); } catch (e) { }
      }

      // console.log('Users found:', users)

      if (users.length > 0) {
        const adminDocs: any[] = []

        users.forEach(user => {
          adminDocs.push({
            user: user._id,
            community: savedCommunity._id,
            assigned_by: new Types.ObjectId(userId),
            can_approve_workshop: adminPermissions.can_approve_workshop || false
          })
        });
        if (adminDocs.length > 0) {
          await this.communityadminModel.insertMany(adminDocs);
        }
        console.log(`Assigned ${adminDocs.length} admins successfully.`);

      }
    }
    return savedCommunity;
  }

  async findAll(): Promise<Community[]> {
    return this.communityModel.find({ is_active: true })
      .populate('shops')
      .populate('events')
      .populate('workshops')
      .exec();
  }

  async findOne(id: string, userId?: string): Promise<Community> {
    const community = await this.communityModel.findById(id)
      .populate('shops')
      .populate('events')
      .populate('workshops')
      .exec();
    if (!community) {
      throw new NotFoundException(`Community with ID ${id} not found`);
    }
    await this.communityViewModel.create({
      community: new Types.ObjectId(id),
      user: userId ? new Types.ObjectId(userId) : null,
    });
    
    return community;
  }

  async findByIdOrSlug(identifier: string, userId?: string): Promise<Community> {
    if (Types.ObjectId.isValid(identifier)) {
      const doc = await this.communityModel.findOne({
        _id: identifier,
        is_active: true
      }).exec();
      if (doc) return doc;
    }
    const decodedSlug = decodeURIComponent(identifier);
    const community = await this.communityModel.findOne({
      $or: [{ slug: decodedSlug }, { name: decodedSlug }],
      is_active: true
    }).exec();

    if (!community) {
      throw new NotFoundException('Community not found');
    }
    // console.log('recording view for:', identifier, 'user:', userId); 

    await this.communityViewModel.create({
      community: community._id,
      user: userId ? new Types.ObjectId(userId) : null,
    });
    return community;
  }

  async findMyCommunity(userId: string) {
    const adminRecord = await this.communityadminModel.findOne({
      user: new Types.ObjectId(userId)
    }).exec();
    if (!adminRecord) {
      throw new NotFoundException('You are not in any community administrator.');
    }
    const community = await this.communityModel.findById(adminRecord.community).exec();
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return community;
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateCommunityDto: UpdateCommunityDto,
    files: Array<Express.Multer.File>
  ) {

    if (userRole === UserRole.ADMIN) {
      const isAdmin = await this.communityadminModel.findOne({
        community: new Types.ObjectId(id),
        user: new Types.ObjectId(userId),
      })

      if (!isAdmin) {
        throw new ForbiddenException('You are not an admin of this community')
      }

      // ถ้าไม่อยากให้ community admin มีสิทธ์แก้ไข admin lists
      // delete updateCommunityDto.admins
    }

    const existingCommunity = await this.communityModel.findById(id).select('images');
    if (!existingCommunity) {
      throw new NotFoundException(`Community #${id} not found`);
    }

    const previousImages = Array.isArray(existingCommunity.images)
      ? [...existingCommunity.images]
      : [];

    let nextImages: string[] | null = null;

    if (Array.isArray(updateCommunityDto.images)) {
      nextImages = updateCommunityDto.images;
    } else {
      let computedImages: string[] = [];

      if (updateCommunityDto.existing_images) {
        if (Array.isArray(updateCommunityDto.existing_images)) {
          computedImages = [...updateCommunityDto.existing_images];
        } else {
          computedImages = [updateCommunityDto.existing_images];
        }
      }

      if (files && files.length > 0) {
        const newImagePaths = files.map(file =>
          `/uploads/communities/${file.filename}`
        );
        computedImages = [...newImagePaths, ...computedImages];
      }

      if (computedImages.length > 0) {
        nextImages = computedImages;
        updateCommunityDto.images = computedImages;
      }
    }

    const imagesToDelete = Array.isArray(nextImages)
      ? previousImages.filter(imagePath => imagePath && !nextImages.includes(imagePath))
      : [];

    const updateData: any = { ...updateCommunityDto };
    delete updateData.admins;
    delete updateData.existing_images;

    // userRole === UserRole.PLATFORM_ADMIN && ถ้าอยากให้มีแค่ platform admin ที่แก้ admin lists ได้
    if (updateCommunityDto.admins !== undefined) {
      let adminsList: any = updateCommunityDto.admins;
      if (typeof adminsList === 'string') {
        try { adminsList = JSON.parse(adminsList); }
        catch { adminsList = []; }
      }

      const users = await this.userModel.find({
        email: { $in: adminsList }
      }).select('_id');

      await this.communityadminModel.deleteMany({
        community: new Types.ObjectId(id)
      });

      if (users.length > 0) {
        const adminDocs = users.map(user => ({
          user: user._id,
          community: new Types.ObjectId(id),
          assigned_by: new Types.ObjectId(userId),
          can_approve_workshop: false
        }));

        await this.communityadminModel.insertMany(adminDocs);
      }
    }
    const finalDto = await this.fillEnglishFieldsForUpdate(updateData);
    const updatedCommunity = await this.communityModel.findByIdAndUpdate(
      id,
      finalDto,
      { new: true, runValidators: true }
    );
    if (!updatedCommunity) {
      throw new NotFoundException(`Community #${id} not found`);
    }

    if (imagesToDelete.length > 0) {
      await this.deleteImageFiles(imagesToDelete);
    }

    return updatedCommunity;
  }

  private async deleteImageFiles(imagePaths: string[]) {
    if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
      return;
    }

    await Promise.all(imagePaths.map(async (imagePath) => {
      if (!imagePath || /^https?:\/\//i.test(imagePath)) {
        return;
      }

      const normalized = imagePath.replace(/^[/\\]+/, '');
      const absolutePath = path.join(process.cwd(), normalized);

      try {
        await fsPromises.unlink(absolutePath);
      } catch (error: any) {
        if (error?.code !== 'ENOENT') {
          console.warn(`Failed to delete unused community image at ${absolutePath}:`, error);
        }
      }
    }));
  }

  async addAdminByEmail(communityId: string, email: string, addedById: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const community = await this.communityModel.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const existingAdmin = await this.communityadminModel.findOne({
      user: user._id,
      community: community._id,
    });

    if (existingAdmin) {
      throw new ConflictException('User is already an admin of this community');
    }

    const newAdmin = new this.communityadminModel({
      user: user._id,
      community: community._id,
      can_approve_workshop: true,
      role: 'COMMUNITY_ADMIN',
      addedBy: addedById,
    });

    await newAdmin.save();

    return { message: 'Admin added successfully', admin: newAdmin };
  }

  private async fillEnglishFieldsForUpdate(dto: UpdateCommunityDto) {
    const result = { ...dto };
    if (dto.history) {
      result.history_en = await this.autoTranslate(dto.history);
    }
    if (dto.hero_section?.title) {
      result.hero_section = {
        ...dto.hero_section,
        title_en: await this.autoTranslate(dto.hero_section.title),
        description_en: dto.hero_section.description
          ? await this.autoTranslate(dto.hero_section.description)
          : undefined
      };
    }
    return result;
  }

  async removeAdmin(communityId: string, adminId: string) {
    if (!Types.ObjectId.isValid(adminId) || !Types.ObjectId.isValid(communityId)) {
      throw new BadRequestException('Invalid id format');
    }
    const deleted = await this.communityadminModel.findOneAndDelete({
      _id: new Types.ObjectId(adminId),
      community: new Types.ObjectId(communityId),
    });
    if (!deleted) {
      throw new NotFoundException('Admin not found in this community');
    }
    return { message: 'Admin removed successfully' };
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

  async close(id: string) {
    // อัปเดต is_active เป็น false
    const community = await this.communityModel.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );
    if (!community) {
      throw new NotFoundException(`Community #${id} not found`);
    }
    await this.communityadminModel.deleteMany({
      community: new Types.ObjectId(id)
    });
    return {
      message: 'Community closed successfully',
      community
    };
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

  async getShops(identifier: string) {
    let community;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

    if (isObjectId) {
      community = await this.communityModel.findById(identifier);
    } else {
      community = await this.communityModel.findOne({ slug: identifier }); 
    }
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const shops = await this.shopModel
      .find({ communityId: community._id })
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



