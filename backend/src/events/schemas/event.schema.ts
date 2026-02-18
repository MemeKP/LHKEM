import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose"; /* Added Document import */
import { EventStatus } from "../events.types";

export type EventDocument = Event & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Event {
  @Prop({
    type: Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
  })
  community_id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  created_by: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['COMMUNITY_ADMIN', 'PLATFORM_ADMIN'],
    required: true,
  })
  created_by_role: 'COMMUNITY_ADMIN' | 'PLATFORM_ADMIN';

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  images?: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  start_at: Date;

  @Prop({ required: true })
  end_at: Date;

  @Prop({ required: true })
  seat_limit: number;

  @Prop({ default: 0 })
  deposit_amount: number;

  @Prop({
    type: String,
    enum: EventStatus,
    default: EventStatus.OPEN,
    index: true,
  })
  status: EventStatus;

  /* Timestamps are handled by @Schema({ timestamps: true }) */
  created_at: Date;
  updated_at: Date;

  @Prop({ default: false, index: true })
  is_featured: boolean;

  @Prop({ default: false })
  is_pinned: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);

/* Added indices for query optimization */
EventSchema.index({ community_id: 1, start_at: 1 });
EventSchema.index({ community_id: 1, is_featured: 1 });
EventSchema.index({ community_id: 1, status: 1 });