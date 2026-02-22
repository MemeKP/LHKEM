import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityViewDocument = CommunityView & Document;

@Schema({ timestamps: true })
export class CommunityView {
  @Prop({ type: Types.ObjectId, ref: 'Community', required: true, index: true })
  community: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  user: Types.ObjectId | null;

  @Prop({ default: Date.now, index: true })
  viewed_at: Date;
}

export const CommunityViewSchema = SchemaFactory.createForClass(CommunityView);