// src/shop/schemas/shop.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Shop {
  @Prop({ required: true })
  shopName: string;

  @Prop()
  picture: string;

  @Prop()
  coverUrl?: string;

  @Prop()
  iconUrl?: string;

  @Prop()
  description: string;

  @Prop()
  openTime: string;

  @Prop()
  closeTime?: string;

  @Prop({
    type: {
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    _id: false,
  })
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
  };

  @Prop({
    type: {
      line: String,
      facebook: String,
      phone: String,
    },
    _id: false,
  })
  contact: {
    line?: string;
    facebook?: string;
    phone?: string;
  };

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Community', required: true })
  communityId: Types.ObjectId;

  @Prop({
  type: String,
  enum: ['PENDING', 'ACTIVE', 'REJECTED'],
  default: 'PENDING',
  })
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
