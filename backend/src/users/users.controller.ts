import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 🔐 PROTECTED - Change password (ต้องอยู่ก่อน 'me' เพื่อป้องกัน route conflict)
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(@Req() req, @Body() body: { currentPassword: string; newPassword: string }) {
    await this.usersService.changePassword(req.user.userId, body.currentPassword, body.newPassword);
    return { message: 'Password updated successfully' };
  }

  // 🔐 PROTECTED
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone,
      created_at: user.created_at
    };
  }

  // 🔐 PROTECTED - Update current user profile
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(req.user.userId, updateUserDto);
    return {
      userId: updatedUser.user_id,
      email: updatedUser.email,
      role: updatedUser.role,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      phone: updatedUser.phone,
      created_at: updatedUser.created_at
    };
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
