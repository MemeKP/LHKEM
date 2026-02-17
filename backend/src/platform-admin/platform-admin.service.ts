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

    // const admins = await this.communityAdminModel.countDocuments({
    //   community: objectId
    // })

    const adminDocs = await this.communityAdminModel.find({ community: objectId })
      .populate('user', 'username email')
      .lean();

    const adminsList = adminDocs.map((doc: any) => {
      const user = doc.user;
      const joinYear = new Date(doc.createdAt).getFullYear() + 543; 

      return {
        id: doc._id.toString(), 
        name: user?.username || user?.email || 'Unknown', 
        email: user?.email || '-',
        joinDate: joinYear.toString(), 
        userId: user?._id?.toString() 
      };
    });

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

    const shopsList = shops.map(shop => {
      const shopWorkshopsCount = workshops.filter(w => 
        w['shop']?.toString() === shop._id.toString() || 
        w['shop_id']?.toString() === shop._id.toString()
      ).length;

      return {
        id: shop._id.toString(),
        name: shop.shopName,
        workshops: shopWorkshopsCount,
        members: 0, // ตอนนี้ยังไม่มีระบบสมาชิกแยกรายร้าน ให้ใส่ 0 หรือ mock ไปก่อน
        status: (shop.status || 'inactive').toLowerCase() 
      };
    });

    console.log('Community Data:', JSON.stringify(community, null, 2));
    
    const allItems = [...workshops, ...events];

    const checkStatus = (item: any, statusToCheck: string) => {
        return (item.status || 'PENDING').toUpperCase() === statusToCheck;
    };

    const pendingCount = allItems.filter(i => checkStatus(i, 'PENDING')).length;
    const activeCount = allItems.filter(i => 
        checkStatus(i, 'ACTIVE') || checkStatus(i, 'APPROVED') || checkStatus(i, 'ONGOING')
    ).length;
    const completedCount = allItems.filter(i => checkStatus(i, 'COMPLETED') || checkStatus(i, 'FINISHED')).length;

    const workshopsEventsData = [
      { 
        label: 'รายการทั้งหมด', 
        count: allItems.length, 
        color: 'green' 
      },
      { 
        label: 'รอการอนุมัติ', 
        count: pendingCount, 
        color: 'orange' 
      },
      { 
        label: 'กำลังดำเนินการ', 
        count: activeCount, 
        color: 'orange' 
      },
      { 
        label: 'เสร็จสิ้น', 
        count: completedCount, 
        color: 'gray' 
      }
    ];

    // Popular Activity (Bar Chart) นับจาก Workshop 
    let popularActivityData: any[] = [];

    if (workshops.length > 0) {
      const categoryCount = workshops.reduce((acc, curr) => {
        const cat = curr['category'] || curr['type'] || 'Workshop'; 
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      popularActivityData = Object.keys(categoryCount).map(key => ({
        name: key,
        value: categoryCount[key]
      }));
      
      // เรียงลำดับมากไปน้อย และตัดเอาแค่ 5 อันดับแรก
      popularActivityData.sort((a, b) => b.value - a.value).splice(5);
    }

    // ถ้าไม่มี Workshop เลย (หรือ Data ว่าง) ให้ส่งค่า Mock ไปก่อน
    if (popularActivityData.length === 0) {
      popularActivityData = [
        { name: 'Craft', value: 12 },
        { name: 'Cooking', value: 8 },
        { name: 'Culture', value: 6 },
        { name: 'Nature', value: 4 }
      ];
    }

    // Participant Types (Pie Chart) - Mock ไปก่อน
    const localCount = shops.length + adminDocs.length; // ร้านค้า + แอดมิน = คนพื้นที่
    
    // !!! ตอนนี้ Workshop ยังไม่มี participant เป็น 0 ตามด้านบนอยู่
    // ถ้าเสร็จแล้วให้ใช้ bookings.length หรือ participants.length 
    const touristCount = participantsCount > 0 ? participantsCount : 25; // ใส่ mock (ถ้าไม่มีคนเลย กราฟจะพัง)

    const totalPeople = localCount + touristCount;

    // คำนวณ % 
    let localPercent = 0;
    let touristPercent = 0;

    if (totalPeople > 0) {
        localPercent = Math.round((localCount / totalPeople) * 100);
        touristPercent = 100 - localPercent; // เพื่อให้รวมกันได้ 100 เสมอ
    } else {
        // ถ้าไม่มีข้อมูลเลย ให้ mock ค่า default
        localPercent = 60;
        touristPercent = 40;
    }

    const participantTypeData = [
        { 
          name: 'Local (คนในพื้นที่)', 
          value: localPercent, 
          color: '#16a34a' // เขียว
        },
        { 
          name: 'Tourist (นักท่องเที่ยว)', 
          value: touristPercent, 
          color: '#f97316' // ส้ม
        }
    ];

    return {
      id: community._id.toString(),
      name: community.name,
      location: community.location.full_address,

      is_active: community.is_active ?? true,
      stats: {
        shops: {
          current: activeShops.length,
          total: shops.length,
        },
        admins: adminDocs.length,
        workshops: workshops.length,
        participants: participantsCount,
        growth: '+0%', // ค่อยคำนวณทีหลัง
        workshopsAndEventsCount: workshopsAndEventsCount
      },

      alerts: this.generateAlerts(shops, workshops),
      shopsList: shopsList,
      workshopsEvents: workshopsEventsData,
      admins: adminsList,
      participantTypeData,
      popularActivityData,
    };
  }

  async getDashboardData(): Promise<PlatformDashboardResponseDto> {
    const communitiesData = await this.communityModel.aggregate<CommunityAggregationResult>([
      {
        $match: {
          is_active: { $ne: false }
        }
      },
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
      message: `Workshop ได้รับอนุมัติแล้ว ${approvalRate}% `,
      time: 'ล่าสุด',
    });

    return alerts;
  }

}

