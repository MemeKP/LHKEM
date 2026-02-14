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
  description: string;

  @Prop()
  openTime: string;

  @Prop({
    type: {
      line: String,
      facebook: String,
      phone: String,
    },
  })
  contact: {
    line?: string;
    facebook?: string;
    phone?: string;
  };

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
