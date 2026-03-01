import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type WorkshopDocument = Workshop & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Workshop {
  @Prop({ required: true, trim: true })
  /* Workshop name */
  title: string;

  @Prop({ required: true, type: Number })
  /* Cost per slot */
  price: number;

  @Prop({ required: true, type: Number })
  /* Total available slots */
  capacity: number;

  @Prop({ required: true })
  /* Information about the workshop */
  description: string;

  @Prop({ required: true, type: Date })
  /* Event date */
  date: Date;

  @Prop({ type: Date })
  /* Explicit workshop event date (mirrors `date` for newer clients) */
  workshopDate?: Date;

  // ------------------------------------------------------
  // 1. CLIENT SIDE: Can users book this workshop right now?
  // ------------------------------------------------------
  @Prop({
    type: String,
    enum: ['OPEN', 'CLOSED', 'FULL', 'CANCELLED'],
    default: 'OPEN',
    index: true,
  })
  /* Registration status */
  registrationStatus: string;
  
  @Prop({ required: true })
  shopId: string;

  // ------------------------------------------------------
  // 2. ADMIN SIDE: Is the workshop approved to be shown on the platform?
  // ------------------------------------------------------
  @Prop({ 
    type: String, 
    enum: ['PENDING', 'ACTIVE', 'REJECTED', 'CLOSED', 'CHANGE'], 
    default: 'PENDING',
    index: true 
  })
  /* Admin approval status */
  approvalStatus: string;

  // Add these inside your Workshop class:
  @Prop() startDate: string;
  @Prop() endDate: string;
  @Prop() startTime: string;
  @Prop() endTime: string;
  @Prop() image: string;
  @Prop({
    type: String,
    enum: ['shop', 'custom'],
    default: 'shop'
  })
  locationType: 'shop' | 'custom';

  @Prop()
  customLocation?: string;
  @Prop({ type: Number, default: 0 }) views: number;
  @Prop({ type: String, default: '' }) rejectReason: string;

  // ขออนุญาตินะยุยิ <3
  @Prop({ type: Types.ObjectId, ref: 'Community', required: true, index: true })
  communityId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  current_participants: number;

  @Prop({
    type: String,
    enum: ['งานฝีมือ', 'อาหาร', 'ศิลปะ', 'วัฒนธรรม'],
    default: 'งานฝีมือ',
    index: true,
  })
  category: string;
}

export const WorkshopSchema = SchemaFactory.createForClass(Workshop);

/* Updated Index: Searching workshops by date, approval, and registration availability */
WorkshopSchema.index({ date: 1, approvalStatus: 1, registrationStatus: 1 });

WorkshopSchema.index({ community_id: 1 });
WorkshopSchema.index({ community_id: 1, category: 1 });
