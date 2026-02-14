import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { CommunityAdmin, CommunityAdminDocument } from 'src/community-admin/schemas/community-admin.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(CommunityAdmin.name) private communityAdminModel: Model<CommunityAdminDocument>,
  ) {}

  async login(email: string, password: string) {
    // 1. หา user จาก email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. เช็ค password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // ของ community admin
    let community_id: string | null = null;
    // เช็ค Role: ถ้าเป็น Admin ชุมชน ให้วิ่งไปดูตาราง CommunityAdmin
   if ((user.role as string) === 'COMMUNITY_ADMIN') {
      const relation = await this.communityAdminModel.findOne({ user_id: user._id });
      
      if (relation) {
        community_id = relation.community_id.toString(); 
      } else {
        console.warn(`User ${user._id.toString()} is COMMUNITY_ADMIN but has no community linked!`);
      }
    }

    // 3. สร้าง JWT payload
    const payload = {
      sub: user.user_id.toString(), // ใช้ _id จากmongodbแทนuserId แก้ปัญหาหาobjecytIdไม่เจอ
      role: user.role,
      community_id: community_id
    };

    // 4. sign token
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        role: user.role,
        community_id: community_id
      }
    };
  }
}
