import { Injectable } from '@nestjs/common';
import { MapPin } from './schemas/map-pin.schema';
import { Model } from 'mongoose';
import { CommunityMap } from './schemas/community-map.schema';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { CreateMapPinDto } from './dto/create-map-pin.dto';
import { UpdateMapPinDto } from './dto/update-map-pin.dto';


@Injectable()
export class CommunityMapService {
  constructor(
    @InjectModel(CommunityMap.name)
    private communityMapModel: Model<CommunityMap>,

    @InjectModel(MapPin.name)
    private mapPinModel: Model<MapPin>,
  ) {}

async getCommunityMap(communityId: string) {
  const map = await this.communityMapModel.findOne({ communityId });
  if (!map) throw new NotFoundException('Map not found');

  const pins = await this.mapPinModel.find({ communityId });

  return {
    map_image: map.imageUrl,
    pins: pins.map(p => ({
      id: p._id,
      type: p.type,
      label: p.label,
      position_x: p.positionX,
      position_y: p.positionY,
    })),
  };
}

async uploadMap(communityId: string, imageUrl: string) {
  return this.communityMapModel.findOneAndUpdate(
    { communityId },
    { imageUrl },
    { upsert: true, new: true },
  );
}

async createPin(communityId: string, dto: CreateMapPinDto) {
  return this.mapPinModel.create({
    communityId,
    type: dto.type,
    refId: dto.ref_id,
    label: dto.label,
    positionX: dto.position_x,
    positionY: dto.position_y,
  });
}
async updatePin(pinId: string, dto: UpdateMapPinDto) {
  return this.mapPinModel.findByIdAndUpdate(
    pinId,
    {
      positionX: dto.position_x,
      positionY: dto.position_y,
    },
    { new: true },
  );
}

async deletePin(pinId: string) {
  return this.mapPinModel.findByIdAndDelete(pinId);
}

async getPinDetail(pinId: string) {
  const pin = await this.mapPinModel.findById(pinId);
  if (!pin) throw new NotFoundException();

  switch (pin.type) {
    case 'SHOP':
      return { type: 'SHOP', refId: pin.refId };

    default:
      return pin;
  }
}
}
