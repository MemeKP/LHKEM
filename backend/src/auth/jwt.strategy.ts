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
    userId: user._id.toString(), // ⭐ ใช้ field นี้เป็นหลัก
    role: user.role,
    email: user.email,           // (optional)
  };
}

}
