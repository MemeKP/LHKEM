import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlatformActivityDocument = PlatformActivity & Document;

export enum ActivityType {
  SHOP = 'shop',
  WORKSHOP = 'workshop',
  EVENT = 'event',
  MEMBER = 'member',
}

export enum ActivityAction {
  CREATED = 'CREATED',
  CANCELLED = 'CANCELLED',
  JOINED = 'JOINED',
  UPDATED = 'UPDATED',
}

@Schema({ timestamps: true })
export class PlatformActivity {
  @Prop({ required: true, enum: ActivityType })
  type: ActivityType;

  @Prop({ required: true, enum: ActivityAction })
  action: ActivityAction;

  @Prop({ required: true })
  message: string; 

  @Prop({ type: Object })
  metadata: {
    communityId?: string;
    shopId?: string;
    refId?: string; 
  };

  @Prop({ default: 'orange' })
  color: string;

  created_at: Date; 
  updated_at: Date;
}

export const PlatformActivitySchema = SchemaFactory.createForClass(PlatformActivity);