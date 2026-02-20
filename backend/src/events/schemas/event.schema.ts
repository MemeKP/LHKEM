import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
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

    @Prop({ trim: true })
    title_en: string;

    @Prop()
    images?: string[];

    @Prop({ required: true })
    description: string;

    @Prop()
    description_en: string;

    @Prop({
        type: {
            full_address: { type: String, default: '' },
            province: { type: String, default: '' },
            coordinates: {
                lat: { type: Number, default: 0 },
                lng: { type: Number, default: 0 }
            }
        },
        _id: false
    })
    location: {
        full_address: string;
        province: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };

    @Prop({
        type: {
            phone: String,
            line: String,
            facebook: String,
            coordinator_name: String,
        },
        _id: false,
    })
    contact: {
        phone: string;
        line: string;
        facebook: string;
        coordinator_name: string;
    };


    @Prop()
    event_type: string;

    @Prop({ type: [String], default: [] })
    workshops: string[];

    @Prop()
    target_audience: string;


    @Prop()
    additional_info: string;


    @Prop({ required: true })
    start_at: Date;

    @Prop({ required: true })
    end_at: Date;

    @Prop({ required: true })
    seat_limit: number;

    @Prop({})
    deposit_amount: number;

    @Prop({
        type: String,
        enum: EventStatus,
        default: EventStatus.OPEN,
        index: true,
    })
    status: EventStatus;

    @Prop({ default: false, index: true })
    is_featured: boolean;

    @Prop({ default: false })
    is_pinned: boolean;

    @Prop([{
        user: { type: Types.ObjectId, ref: 'User' },
        joined_at: { type: Date, default: Date.now }, // วันที่กดเข้าร่วม
        status: { type: String, default: 'CONFIRMED' } // เผื่อไว้ (เช่น CANCELLED)
    }])
    participants: {
        user: Types.ObjectId;
        joined_at: Date;
        status: string;
    }[];
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ community_id: 1, start_at: 1 });
EventSchema.index({ community_id: 1, is_featured: 1 });
EventSchema.index({ community_id: 1, status: 1 });
