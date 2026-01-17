// src/shop/shop.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shop } from './schemas/shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectModel(Shop.name) private shopModel: Model<Shop>,
  ) {}

  async create(userId: string, dto: CreateShopDto) {
  const exists = await this.shopModel.findOne({ userId });
  if (exists) {
    throw new BadRequestException('User already has a shop');
  }

  return this.shopModel.create({
    shopName: dto.shopName,
    description: dto.description,
    picture: dto.picture,
    openTime: dto.openTime,
    contact: dto.contact,
    userId,
    communityId: new Types.ObjectId(dto.communityId),
    status: 'PENDING',
  });
}


  async findMyShop(userId: string) {
    const shop = await this.shopModel.findOne({ userId });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async update(shopId: string, userId: string, dto: UpdateShopDto) {
    const shop = await this.shopModel.findById(shopId);
    if (!shop) throw new NotFoundException();

    if (shop.userId.toString() !== userId) {
      throw new ForbiddenException();
    }

    Object.assign(shop, dto);
    return shop.save();
  }

  async findPublic(shopId: string) {
  return this.shopModel.findOne({
    _id: shopId,
    status: 'ACTIVE',
  });
}


  async findByCommunity(communityId: string) {
  return this.shopModel.find({
    communityId: new Types.ObjectId(communityId),
    status: 'ACTIVE',
  });
}

  async findActiveShopByUser(userId: string) {
  const shop = await this.shopModel.findOne({ userId });

  if (!shop) {
    throw new NotFoundException('Shop not found');
  }

  if (shop.status !== 'ACTIVE') {
    throw new ForbiddenException('Shop is not approved yet');
  }

  return shop;
}
// shop.service.ts
async findPendingByCommunity(communityId: string) {
  return this.shopModel.find({
    communityId: new Types.ObjectId(communityId),
    status: 'PENDING',
  });
}
// shop.service.ts
async approveShop(shopId: string) {
  const shop = await this.shopModel.findById(shopId);
  if (!shop) throw new NotFoundException();

  shop.status = 'ACTIVE';
  return shop.save();
}

async rejectShop(shopId: string) {
  const shop = await this.shopModel.findById(shopId);
  if (!shop) throw new NotFoundException();

  shop.status = 'REJECTED';
  return shop.save();
}


}
