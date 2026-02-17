import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityAdminDocument = CommunityAdmin & Document;

@Schema({ timestamps: true, collection: 'community_admins' })
export class CommunityAdmin {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, ref: 'Community', required: true })
  community: Types.ObjectId;
  
  @Prop({ type: Boolean, default: false })
  can_approve_workshop: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' }) 
  assigned_by?: Types.ObjectId;
}

export const CommunityAdminSchema = SchemaFactory.createForClass(CommunityAdmin);

CommunityAdminSchema.index({ user: 1, community: 1 }, { unique: true });