import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityAdminDocument = CommunityAdmin & Document;

@Schema({ timestamps: true, collection: 'community_admins' })
export class CommunityAdmin {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, ref: 'Community', required: true })
  community_id: Types.ObjectId; 
}

export const CommunityAdminSchema = SchemaFactory.createForClass(CommunityAdmin);