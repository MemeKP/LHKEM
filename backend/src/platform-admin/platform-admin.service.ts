import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Community } from '../communities/schemas/community.schema';
import { PlatformActivity } from './schemas/platform-activity.schema';
import { User } from 'src/users/schemas/users.schema';
import { PlatformDashboardResponseDto } from './dto/platform-dashboard.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Shop } from 'src/shops/schemas/shop.schema';
import { Workshop } from 'src/workshops/schemas/workshop.schema';
import { CommunityDetailResponseDto } from './dto/community-detail.dto';
import { Event } from 'src/events/schemas/event.schema';
import { CommunityAdmin } from 'src/community-admin/schemas/community-admin.schema';
interface CommunityAlert {
  type: 'warning' | 'success' | 'info';
  message: string;
  time: string;
}

interface CommunityAggregationResult {
  _id: Types.ObjectId;
  name: string;
  location: {
    province: string;
  };
  images: string[];
  created_at: Date;
  shopsCount: number;
  membersCount: number;
}

@Injectable()
export class PlatformAdminService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<Community>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PlatformActivity.name) private activityModel: Model<PlatformActivity>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Shop.name) private shopModel: Model<Shop>,
    @InjectModel(Workshop.name) private workshopModel: Model<Workshop>,
    @InjectModel(CommunityAdmin.name) private communityAdminModel: Model<CommunityAdmin>,
  ) { }

  //   async getCommunityDetail(id: string) {
  //   const community = await this.communityModel
  //     .findById(id)
  //     .lean();

  //   if (!community) {
  //     throw new NotFoundException('Community not found');
  //   }
  //   return community;
  // }


  async getCommunityDetail(id: string): Promise<CommunityDetailResponseDto> {
    const community = await this.communityModel.findById(id).lean();
    if (!community) throw new NotFoundException();
    const objectId = new Types.ObjectId(id);

    const shops = await this.shopModel.find({ communityId: objectId }).lean();

    const admins = await this.communityAdminModel.countDocuments({
      community_id: objectId
    })

    const workshops = await this.workshopModel.find({
      community_id: objectId,
    }).lean();

    const events = await this.eventModel.find({
      community_id: objectId,
    }).lean()

    const workshopsAndEventsCount = workshops.length + events.length

    // const participantsCount = workshops.reduce(
    //   (sum, w) => sum + (w.participants?.length || 0),
    //   0,
    // );

    const participantsCount = 0;

    const activeShops = shops.filter(s => s.status === 'ACTIVE');
    console.log('Community Data:', JSON.stringify(community, null, 2));
    return {
      id: community._id.toString(),
      name: community.name,
      location: community.location.full_address,

      stats: {
        shops: {
          current: activeShops.length,
          total: shops.length,
        },
        admins,
        workshops: workshops.length,
        participants: participantsCount,
        growth: '+0%', // ค่อยคำนวณทีหลัง
        workshopsAndEventsCount: workshopsAndEventsCount
      },

      alerts: this.generateAlerts(shops, workshops),
    };
  }

  async getDashboardData(): Promise<PlatformDashboardResponseDto> {
    const communitiesData = await this.communityModel.aggregate<CommunityAggregationResult>([
      {
        $lookup: {
          from: 'shops',
          localField: '_id',
          foreignField: 'community',
          as: 'shops'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'community',
          as: 'members'
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          'location.province': 1,
          images: 1, // array ของรูป
          created_at: 1,
          shopsCount: { $size: '$shops' },
          membersCount: { $size: '$members' }
        }
      },
      { $sort: { created_at: -1 } }
    ]);

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const backendUrl = process.env.BACKEND_URL

    const communities = communitiesData.map(c => {
      const createdDate = new Date(c.created_at || c['createdAt'] || Date.now());
      const imagePath = c.images?.[0] || '';
      // community ที่พึ่งสร้างเมื่อ 30 วันที่ผ่านมา
      const isNew = createdDate > thirtyDaysAgo;

      return {
        id: c._id.toString(),
        name: c.name,
        location: c.location?.province || 'N/A',
        image: imagePath ? `${backendUrl}${imagePath}` : '',
        status: isNew ? 'NEW' : null,
        stats: {
          shops: c.shopsCount || 0,
          members: c.membersCount || 0
        }
      }
    });

    const totalCommunities = communities.length;
    const newCommunities = communities.filter(c => c.status === 'NEW').length;

    // const totalParticipants = await this.userModel.countDocuments({ role: 'TOURIST' });
    const totalParticipants = await this.userModel.countDocuments({
      role: UserRole.TOURIST
    });
    const totalEvents = await this.eventModel.countDocuments({
      status: 'OPEN'
    });

    const activitiesRaw = await this.activityModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    const activities = activitiesRaw.map(a => ({
      id: a._id.toString(),
      type: a.type,
      message: a.message,
      time: a['created_at'] || new Date(),
      color: a.color
    }));

    return {
      stats: {
        totalCommunities,
        newCommunities,
        totalParticipants,
        totalEvents
      },
      communities,
      activities
    };
  }

  private generateAlerts(shops, workshops) {
    const alerts: CommunityAlert[] = [];

    const pendingShops = shops.filter(s => s.status === 'pending');

    if (pendingShops.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${pendingShops.length} ร้านรอยืนยันตัวตน`,
        time: 'ล่าสุด',
      });
    }

    const approvedWorkshops = workshops.filter(w => w.status === 'approved');
    const approvalRate =
      workshops.length > 0
        ? Math.round((approvedWorkshops.length / workshops.length) * 100)
        : 0;

    alerts.push({
      type: 'success',
      message: `Workshop ได้รับอนุมัติแล้ว ${approvalRate}%`,
      time: 'ล่าสุด',
    });

    return alerts;
  }

}

