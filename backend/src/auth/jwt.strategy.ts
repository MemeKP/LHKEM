import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
  const user = await this.usersService.findById(payload.sub);

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  // ✅ normalize req.user ให้ชัด
  return {
    userId: user.user_id, // ⭐ ใช้ user_id เป็นหลัก (รหัสมนุษย์อ่านง่าย)
    userMongoId: user._id.toString(), // ✅ ใช้ Mongo ObjectId เวลาต้องอ้างอิง collection อื่น
    role: user.role,
    email: user.email,
  };
}

}
