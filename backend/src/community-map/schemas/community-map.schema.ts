import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CommunityMap extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'Community',
    required: true,
    unique: true,
  })
  communityId: Types.ObjectId;

  @Prop({ required: true })
  imageUrl: string;
}

export const CommunityMapSchema =
  SchemaFactory.createForClass(CommunityMap);
