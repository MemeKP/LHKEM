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

  @Prop({
    type: String,
    enum: ['OPEN', 'CLOSED', 'FULL', 'CANCELLED'],
    default: 'OPEN',
    index: true,
  })
  /* Registration status */
  status: string;

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

/* Index for searching workshops by date and status */
WorkshopSchema.index({ date: 1, status: 1 });

WorkshopSchema.index({ community_id: 1 });
WorkshopSchema.index({ community_id: 1, category: 1 });
