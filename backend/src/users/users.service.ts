import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.userModel.create({
      ...dto,
      user_id: `U-${randomUUID()}`,
      password: hashedPassword,
    });
  }

  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  // findAll() {
  //   return `This action returns all users`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
  async findByEmail(email: string) {
    return this.userModel
      .findOne({ email})
      .select('+password');
  }

  async findById(userId: string) {
    return this.userModel.findOne(
      { user_id: userId},
      { password: 0 },
    );
  }

  async findByMongoId(mongoId: string) {
    return this.userModel.findById(mongoId).select('-password');
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findOne({ user_id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update only allowed fields
    if (updateUserDto.firstname !== undefined) user.firstname = updateUserDto.firstname;
    if (updateUserDto.lastname !== undefined) user.lastname = updateUserDto.lastname;
    if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;
    if (updateUserDto.email !== undefined) {
      // Check if new email already exists
      const existing = await this.userModel.findOne({ 
        email: updateUserDto.email,
        user_id: { $ne: userId }
      });
      if (existing) {
        throw new BadRequestException('Email already exists');
      }
      user.email = updateUserDto.email;
    }

    return user.save();
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({ user_id: userId }).select('+password');
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password and update directly
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.updateOne(
      { user_id: userId },
      { $set: { password: hashedPassword } }
    );
  }
}
