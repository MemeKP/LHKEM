import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Community } from '../communities/schemas/community.schema';
import { PlatformActivity } from './schemas/platform-activity.schema';
import { User } from 'src/users/schemas/users.schema';
import { PlatformDashboardResponseDto } from './dto/platform-dashboard.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

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
    @InjectModel(Event.name) private eventModel: Model<Event>
  ) { }

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
      // ถ้า Member ไม่ได้เก็บใน Community โดยตรง อาจต้อง lookup จาก user หรือ table กลาง (สมมติว่า user มี field community_id)
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
      { $sort: { created_at: -1 } } // เรียงตามใหม่ล่าสุด
    ]);

    const isNewCommunity = (date: Date): boolean => {
      if (!date) return false;
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      const createdDate = new Date(date).getTime();
      const now = new Date().getTime();
      return (now - createdDate) < thirtyDaysInMs;
    };

    const communities = communitiesData.map(c => {
      const isNew = isNewCommunity(c.created_at);

      return {
        id: c._id.toString(),
        name: c.name,
        location: c.location?.province || 'N/A',
        image: c.images?.[0] || '',
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
    const totalEvents = 150;

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
}