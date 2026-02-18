// src/community-map/schemas/map-pin.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MapPinStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class MapPin extends Document {
  // 1 shop = 1 pin
  @Prop({
    type: Types.ObjectId,
    ref: 'Shop',
    required: true,
    unique: true,
  })
  ownerShop: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
  })
  communityId: Types.ObjectId;

  @Prop({ required: true })
  positionX: number;

  @Prop({ required: true })
  positionY: number;

  @Prop({
    enum: MapPinStatus,
    default: MapPinStatus.PENDING,
    index: true,
  })
  status: MapPinStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MapPinSchema = SchemaFactory.createForClass(MapPin);
