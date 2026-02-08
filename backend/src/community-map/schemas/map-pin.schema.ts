import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PinType {
  SHOP = 'SHOP',
  
}

@Schema({ timestamps: true })
export class MapPin extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
  })
  communityId: Types.ObjectId;

  @Prop({
    type: String,
    enum: PinType,
    required: true,
  })
  type: PinType;

  @Prop({ required: true })
  refId: Types.ObjectId; // ชี้ไป shop / workshop / event

  @Prop({ required: true })
  label: string;

  @Prop({ required: true, min: 0, max: 100 })
  positionX: number;

  @Prop({ required: true, min: 0, max: 100 })
  positionY: number;
}

export const MapPinSchema = SchemaFactory.createForClass(MapPin);
