// src/community-map/community-map.service.ts
import {
  BadRequestException,
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
import * as path from 'path';
import { promises as fsPromises } from 'fs';

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
    const communityIdString = communityObjectId.toString();

    const map = await this.communityMapModel.findOne({
      communityId: communityObjectId,
    });
    if (!map) throw new NotFoundException('Map not found');

    const pins = await this.mapPinModel
      .find({
        communityId: { $in: [communityObjectId, communityIdString] },
        status: MapPinStatus.APPROVED,
      })
      .populate({
        path: 'ownerShop',
        select: 'shopName description coverUrl iconUrl status',
      });

    const filteredPins = pins.filter((pin) => {
      const ownerShop = pin.ownerShop as unknown;
      const shop =
        ownerShop && typeof ownerShop === 'object' && 'status' in ownerShop
          ? (ownerShop as Shop & { _id: Types.ObjectId })
          : null;

      return shop?.status === 'ACTIVE';
    });

    return {
      map_image: map.imageUrl,
      pins: filteredPins.map((pin) => {
        const ownerShop = pin.ownerShop as unknown;
        const shop =
          ownerShop && typeof ownerShop === 'object' && 'shopName' in ownerShop
            ? (ownerShop as Shop & { _id: Types.ObjectId })
            : null;

        return {
          id: pin._id,
          positionX: pin.positionX,
          positionY: pin.positionY,
          status:
            pin.status === MapPinStatus.APPROVED
              ? 'ACTIVE'
              : pin.status,
          ownerShop: shop
            ? {
                _id: shop._id,
                name: shop.shopName,
                description: shop.description,
                coverUrl: shop.coverUrl,
                iconUrl: shop.iconUrl,
                status: shop.status,
              }
            : null,
        };
      }),
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

  async getShopPinByUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ForbiddenException('Invalid user identifier');
    }

    const shop = await this.shopModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const pin = await this.mapPinModel.findOne({ ownerShop: shop._id });

    if (!pin) {
      return {
        hasPin: false,
        communityId: shop.communityId,
      };
    }

    return {
      hasPin: true,
      communityId: shop.communityId,
      pinId: pin._id,
      position_x: pin.positionX,
      position_y: pin.positionY,
      status: pin.status,
      updatedAt: pin.updatedAt,
    };
  }

  async getShopPinForAdmin(shopId: string) {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new BadRequestException('Invalid shop identifier');
    }

    const shopObjectId = new Types.ObjectId(shopId);
    const pin = await this.mapPinModel.findOne({ ownerShop: shopObjectId });

    if (!pin) {
      return {
        hasPin: false,
        communityId: null,
      };
    }

    return {
      hasPin: true,
      communityId: pin.communityId?.toString() || null,
      pinId: pin._id,
      position_x: pin.positionX,
      position_y: pin.positionY,
      status: pin.status,
    };
  }

  // =========================
  // ADMIN
  // =========================
  async uploadMap(communityId: string, imageUrl: string) {
    const communityObjectId = new Types.ObjectId(communityId);

    const existingMap = await this.communityMapModel
      .findOne({ communityId: communityObjectId })
      .select('imageUrl')
      .lean();

    const updatedMap = await this.communityMapModel.findOneAndUpdate(
      { communityId: communityObjectId },
      { imageUrl },
      { upsert: true, new: true },
    );

    if (existingMap?.imageUrl && existingMap.imageUrl !== imageUrl) {
      await this.deleteMapImage(existingMap.imageUrl);
    }

    return updatedMap;
  }

  private async deleteMapImage(imageUrl: string) {
    if (!imageUrl || /^https?:\/\//i.test(imageUrl)) {
      return;
    }

    const normalizedPath = imageUrl.replace(/^[/\\]+/, '');
    const absolutePath = path.join(process.cwd(), normalizedPath);

    try {
      await fsPromises.unlink(absolutePath);
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        console.warn(`Failed to delete unused community map image at ${absolutePath}:`, error);
      }
    }
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
