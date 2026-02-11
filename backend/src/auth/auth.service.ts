import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

    // 3. สร้าง JWT payload
    const payload = {
      sub: user.user_id.toString(), // ใช้ _id จากmongodbแทนuserId แก้ปัญหาหาobjecytIdไม่เจอ
      role: user.role,
    };

    // 4. sign token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
