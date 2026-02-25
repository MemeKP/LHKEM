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
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user identifier');
    }
    if (!Types.ObjectId.isValid(dto.communityId)) {
      throw new BadRequestException('Invalid community identifier');
    }

    const userObjectId = new Types.ObjectId(userId);
    const communityObjectId = new Types.ObjectId(dto.communityId);

    const exists = await this.shopModel.findOne({
      userId: userObjectId,
    });
    if (exists) {
      throw new BadRequestException('User already has a shop');
    }

    const payload: Partial<Shop> = {
      shopName: dto.shopName,
      description: dto.description,
      address: dto.address,
      picture: dto.picture ?? dto.coverUrl,
      coverUrl: dto.coverUrl,
      iconUrl: dto.iconUrl,
      openTime: this.normalizeTime(dto.openTime),
      closeTime: this.normalizeTime(dto.closeTime),
      location: this.normalizeLocation(dto.location),
      contact: dto.contact,
      images: dto.images,
      userId: userObjectId,
      communityId: communityObjectId,
      status: 'PENDING',
    };

    return this.shopModel.create(payload);
  }


  async findMyShop(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user identifier');
    }
    const userObjectId = new Types.ObjectId(userId);

    const shop = await this.shopModel.findOne({
      userId: userObjectId,
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async update(shopId: string, userId: string, dto: UpdateShopDto) {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new BadRequestException('Invalid shop identifier');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user identifier');
    }

    const shop = await this.shopModel.findById(shopId);
    if (!shop) throw new NotFoundException();

    if (shop.userId.toString() !== userId) {
      throw new ForbiddenException();
    }

    if (dto.shopName !== undefined) shop.shopName = dto.shopName;
    if (dto.description !== undefined) shop.description = dto.description;
    if (dto.address !== undefined) shop.address = dto.address;
    if (dto.picture !== undefined) shop.picture = dto.picture;
    if (dto.coverUrl !== undefined) shop.coverUrl = dto.coverUrl;
    if (dto.iconUrl !== undefined) shop.iconUrl = dto.iconUrl;
    if (dto.openTime !== undefined) shop.openTime = this.normalizeTime(dto.openTime);
    if (dto.closeTime !== undefined) shop.closeTime = this.normalizeTime(dto.closeTime);
    if (dto.location !== undefined) shop.location = this.normalizeLocation(dto.location);
    if (dto.contact !== undefined) shop.contact = dto.contact;
    if (dto.images !== undefined) shop.images = dto.images;

    return shop.save();
  }

  async updateShopImage(
    shopId: string,
    userId: string,
    field: 'cover' | 'icon',
    filePath: string,
  ) {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new BadRequestException('Invalid shop identifier');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user identifier');
    }

    const shop = await this.shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    if (shop.userId.toString() !== userId) {
      throw new ForbiddenException();
    }

    if (field === 'cover') {
      shop.coverUrl = filePath;
      shop.picture = filePath;
    } else if (field === 'icon') {
      shop.iconUrl = filePath;
    }

    await shop.save();
    return shop;
  }

  async findPublic(shopId: string) {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new BadRequestException('Invalid shop identifier');
    }
    return this.shopModel.findOne({
      _id: new Types.ObjectId(shopId),
      status: 'ACTIVE',
    });
  }

  async findByIdAdmin(shopId: string) {
    if (!Types.ObjectId.isValid(shopId)) {
      throw new BadRequestException('Invalid shop identifier');
    }

    const shop = await this.shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }


  async findByCommunity(communityId: string) {
    if (!Types.ObjectId.isValid(communityId)) {
      throw new BadRequestException('Invalid community identifier');
    }
    const shops = await this.shopModel
      .find({
        communityId: new Types.ObjectId(communityId),
        status: 'ACTIVE',
      })
      .populate('userId', 'firstname lastname email phone')
      .lean();
    return shops.map((shop) => this.attachOwnerMetadata(shop));
  }

  async findAllByCommunity(communityId: string) {
    if (!Types.ObjectId.isValid(communityId)) {
      throw new BadRequestException('Invalid community identifier');
    }

    const shops = await this.shopModel
      .find({
        communityId: new Types.ObjectId(communityId),
      })
      .populate('userId', 'firstname lastname email phone')
      .lean();
    return shops.map((shop) => this.attachOwnerMetadata(shop));
  }

  async findActiveShopByUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user identifier');
    }
    const userObjectId = new Types.ObjectId(userId);

    const shop = await this.shopModel.findOne({
      userId: userObjectId,
    });

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
  if (!Types.ObjectId.isValid(communityId)) {
    throw new BadRequestException('Invalid community identifier');
  }
  const shops = await this.shopModel
    .find({
      communityId: new Types.ObjectId(communityId),
      status: 'PENDING',
    })
    .populate('userId', 'firstname lastname email phone')
    .lean();
  return shops.map((shop) => this.attachOwnerMetadata(shop));
}
// shop.service.ts
async approveShop(shopId: string) {
  if (!Types.ObjectId.isValid(shopId)) {
    throw new BadRequestException('Invalid shop identifier');
  }
  const shop = await this.shopModel.findById(shopId);
  if (!shop) throw new NotFoundException();

  shop.status = 'ACTIVE';
  return shop.save();
}

async rejectShop(shopId: string) {
  if (!Types.ObjectId.isValid(shopId)) {
    throw new BadRequestException('Invalid shop identifier');
  }
  const shop = await this.shopModel.findById(shopId);
  if (!shop) throw new NotFoundException();

  shop.status = 'REJECTED';
  return shop.save();
}

  private attachOwnerMetadata(shop: any) {
    if (!shop) return shop;
    const owner = this.buildOwnerFromUserDoc(shop.userId);
    return {
      ...shop,
      owner,
      ownerName: shop.ownerName || owner?.name || owner?.email || shop.ownerName,
    };
  }

  private buildOwnerFromUserDoc(userDoc?: any) {
    if (!userDoc) return null;
    const first = userDoc.firstname?.trim?.() || '';
    const last = userDoc.lastname?.trim?.() || '';
    const fullName = [first, last].filter(Boolean).join(' ').trim();
    return {
      id: userDoc._id?.toString?.() || userDoc.id || null,
      name: fullName || userDoc.email || null,
      email: userDoc.email || null,
      phone: userDoc.phone || null,
    };
  }

  private normalizeLocation(location?: CreateShopDto['location']) {
    if (!location) return undefined;
    const lat = location.lat != null ? Number(location.lat) : undefined;
    const lng = location.lng != null ? Number(location.lng) : undefined;
    return {
      address: location.address,
      lat,
      lng,
    };
  }

  private normalizeTime(value?: string | null) {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
}
