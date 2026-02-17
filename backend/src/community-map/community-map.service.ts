// src/community-map/community-map.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommunityMap } from './schemas/community-map.schema';
import { MapPin, MapPinStatus } from './schemas/map-pin.schema';
import { CreateMapPinDto } from './dto/create-map-pin.dto';
import { Shop } from '../shops/schemas/shop.schema';
import { Types } from 'mongoose';

@Injectable()
export class CommunityMapService {
  constructor(
    @InjectModel(CommunityMap.name)
    private communityMapModel: Model<CommunityMap>,

    @InjectModel(MapPin.name)
    private mapPinModel: Model<MapPin>,

    @InjectModel(Shop.name)
    private shopModel: Model<Shop>,
  ) {}

  // =========================
  // PUBLIC
  // =========================
  async getCommunityMap(communityId: string) {
    const communityObjectId = new Types.ObjectId(communityId);
    
    const map = await this.communityMapModel.findOne({
    communityId: communityObjectId,
    });
    if (!map) throw new NotFoundException('Map not found');

    const pins = await this.mapPinModel.find({
      communityId : communityObjectId,
      status: MapPinStatus.APPROVED,
    });

    return {
      map_image: map.imageUrl,
      pins: pins.map(p => ({
      id: p._id,
      x: p.positionX,
      y: p.positionY,
      shopId: p.ownerShop,
    })),
    };
  }

  // =========================
// PUBLIC – PIN DETAIL
// =========================
async getPinDetail(pinId: string) {
  const pin = await this.mapPinModel
    .findById(pinId)
    .populate({
      path: 'ownerShop',
      select: 'shopName description openTime',
    });

  if (!pin) {
    throw new NotFoundException('Pin not found');
  }

  if (pin.status !== MapPinStatus.APPROVED) {
    throw new NotFoundException('Pin not available');
  }

  const shop: any = pin.ownerShop;

  return {
    pinId: pin._id,
    shopId: shop._id,
    shopName: shop.shopName,
    description: shop.description,
    openTime: shop.openTime,
  };
}


  // =========================
  // SHOP
  // =========================
  async createOrUpdateShopPin(
    userId: string,
    dto: CreateMapPinDto,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ForbiddenException('Invalid user identifier');
    }

    const shop = await this.shopModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    
    if (!shop) {
      throw new ForbiddenException('Shop not found');
    }

    return this.mapPinModel.findOneAndUpdate(
      { ownerShop: shop._id },
      {
        shop_objectId: shop._id,
        communityId: shop.communityId,
        positionX: dto.position_x,
        positionY: dto.position_y,
        status: MapPinStatus.PENDING,
        createdBy: userId,
      },
      { upsert: true, new: true },
    );
  }

  // =========================
  // ADMIN
  // =========================
  async uploadMap(communityId: string, imageUrl: string) {
    const communityObjectId = new Types.ObjectId(communityId);
    return this.communityMapModel.findOneAndUpdate(
      { communityId: communityObjectId },
      { imageUrl },
      { upsert: true, new: true },
    );
  }

  async getPendingPins(communityId: string) {
    const communityObjectId = new Types.ObjectId(communityId);

    return this.mapPinModel.find({
      communityId: communityObjectId,
      status: MapPinStatus.PENDING,
    });
  }

  async approvePin(pinId: string) {
    const pin = await this.mapPinModel.findById(pinId);
    if (!pin) throw new NotFoundException();

    return this.mapPinModel.findByIdAndUpdate(
      pinId,
      {
        status: MapPinStatus.APPROVED,
        approvedAt: new Date(),
      },
      { new: true },
    );
  }

  async deletePin(pinId: string) {
    return this.mapPinModel.findByIdAndDelete(pinId);
  }
}
