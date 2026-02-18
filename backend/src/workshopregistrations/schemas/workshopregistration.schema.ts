import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type WorkshopregistrationDocument = Workshopregistration & Document;

@Schema({
    timestamps: true, /* Automatically manages created_at and updated_at */
    versionKey: false,
})
export class Workshopregistration {
    @Prop({
        type: Number, /* Kept as Number per your initial spec */
        required: true,
        index: true,
    })
    /* The ID of the user registering */
    userId: number;

    @Prop({
        type: Number,
        required: true,
    })
    /* Number of slots booked */
    slots: number;

    @Prop({
        type: String,
        trim: true,
    })
    /* User notes for the workshop */
    note?: string;

    @Prop({
        type: String,
        enum: ['PENDING', 'ACTIVE', 'CANCELLED'],
        default: 'PENDING',
        index: true,
    })
    /* Current status of the registration */
    status: string;
}

export const WorkshopregistrationSchema = SchemaFactory.createForClass(Workshopregistration);

/* Adding index for efficient lookups by user */
WorkshopregistrationSchema.index({ userId: 1, status: 1 });