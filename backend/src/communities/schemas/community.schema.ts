import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CommunityDocument = Community & Document;

@Schema({
    collection: 'communities',
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Community {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ trim: true })
    name_en: string;

    @Prop({ trim: true })
    abbreviation: string;

    @Prop({ required: true, type: String })
    history: string;

    @Prop({ type: String })
    history_en: string;

    @Prop({
        type: {
            title: String,
            title_en: String,
            description: String,
            description_en: String,
            _id: false
        }
    })
    hero_section?: {
        title: string;
        title_en?: string;
        description: string;
        description_en?: string;
    };

    @Prop([{
        title: { type: String, required: true },
        title_en: { type: String },
        desc: { type: String },
        desc_en: { type: String },
        _id: false
    }])
    cultural_highlights: {
        title: string;
        title_en?: string;
        desc: string;
        desc_en?: string;
    }[]

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ type: [String], default: [] })
    videos: string[];

    @Prop({
        type: {
            full_address: { type: String, required: true },
            full_address_en: { type: String },
            house_no: { type: String },
            village: { type: String },
            moo: { type: String },
            alley: { type: String },
            road: { type: String },
            road_en: { type: String },
            province: { type: String, required: true },
            province_en: { type: String },
            district: { type: String },
            district_en: { type: String },
            sub_district: { type: String },
            sub_district_en: { type: String },
            postal_code: { type: String },
            coordinates: {
                type: {
                    lat: { type: Number, required: false },
                    lng: { type: Number, required: false }
                },
                _id: false,
                required: false
            }
        },
        _id: false,
        required: true
    })
    location: {
        full_address: string;
        full_address_en?: string;
        house_no?: string;
        village?: string;
        moo?: string;
        alley?: string;
        road?: string;
        road_en?: string;
        province: string;
        province_en?: string;
        district?: string;
        district_en?: string;
        sub_district?: string;
        sub_district_en?: string;
        postal_code?: string;
        coordinates: {
            lat: number;
            lng: number;
        }
    }

    @Prop({
        type: {
            phone: String,
            email: String,
            facebook: {
                name: String,
                link: String
            },
            line: {
                name: String,
                link: String
            },
            ig: {
                name: String,
                link: String
            },
            website: String
        },
        required: true,
        _id: false
    })
    contact_info: {
        phone?: string;
        email?: string;
        facebook?: { name: string; link: string };
        line?: { name: string; link: string };
        ig?: { name: string, link: string };
        website?: string;
    }

    @Prop({ type: String, unique: true })
    slug: string;

    @Prop({ type: Date })
    created_at: Date;

    @Prop({ type: Date })
    updated_at: Date;

    @Prop({ default: true }) // ตั้งค่าเริ่มต้นเป็น true (เปิดอยู่) <- soft delete จ้าแม่
    is_active: boolean;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);

CommunitySchema.index({ slug: 1 }, { unique: true })
CommunitySchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });

// relation จาก COMMUNITY_ADMIN, EVENTS, USERS, SHOP, WORKSHOP table ที่จะอ้างอิงมาหา
CommunitySchema.virtual('shops', {
    ref: 'Shop',
    localField: '_id',
    foreignField: 'community'
})

CommunitySchema.virtual('events', {
    ref: 'Event',
    localField: '_id',
    foreignField: 'community'
})

CommunitySchema.virtual('workshops', {
    ref: 'Workshop',
    localField: '_id',
    foreignField: 'community'
})

CommunitySchema.virtual('admin', {
    ref: 'Admin',
    localField: '_id',
    foreignField: 'community'
})