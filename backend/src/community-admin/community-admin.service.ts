import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommunityAdminDto } from './dto/create-community-admin.dto';
import { UpdateCommunityAdminDto } from './dto/update-community-admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Community } from 'src/communities/schemas/community.schema';
import { CommunityAdmin } from './schemas/community-admin.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class CommunityAdminService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<Community>,
    @InjectModel(CommunityAdmin.name) private communityAdminModel: Model<CommunityAdmin>,
  ) { }

  create(createCommunityAdminDto: CreateCommunityAdminDto) {
    return 'This action adds a new communityAdmin';
  }

  findAll() {
    return `This action returns all communityAdmin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} communityAdmin`;
  }

  async getCommunityForUpdate(userId: string) {
    const adminRecord = await this.communityAdminModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();
    if (!adminRecord) {
      throw new ForbiddenException('You are not a community admin');
    }

    const community = await this.communityModel.findById(adminRecord.community).lean();
    if (!community) throw new NotFoundException('Community not found');

    const adminsList = await this.communityAdminModel.find({ community: community._id })
      .populate('user', 'email username')
      .lean();

    return {
      ...community,
      id: community._id.toString(),
      admins: adminsList.map(admin => {
        const user = admin.user as any;
        return {
          id: admin._id.toString(),
          email: user?.email || '-',
          name: user?.username || user?.email?.split('@')[0] || 'Admin',
          userId: user?._id?.toString()
        };
      }),
      location: community.location,
    };
  }

  update(id: number, updateCommunityAdminDto: UpdateCommunityAdminDto) {
    return `This action updates a #${id} communityAdmin`;
  }

  remove(id: number) {
    return `This action removes a #${id} communityAdmin`;
  }
}
