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

    @Prop({ required: true, type: String })
    history: string;

    @Prop({
        type: {
            title: String,
            description: String,
            _id: false
        }
    })
    hero_section?: {
        title: string;
        description: string;
    };

    @Prop([{
        title: { type: String, required: true },
        desc: { type: String },
        _id: false
    }])
    cultural_highlights: {
        title: string;
        desc: string;
    }[]

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ type: [String], default: [] })
    videos: string[];

    @Prop({
        type: {
            full_address: { type: String, required: true },
            house_no: { type: String },
            village: { type: String },
            moo: { type: String },
            alley: { type: String },
            road: { type: String },
            province: { type: String, required: true },
            district: { type: String },
            sub_district: { type: String },
            postal_code: { type: String },
            coordinates: {
                type: {
                    lat: { type: Number, required: true },
                    lng: { type: Number, required: true }
                },
                _id: false,
                required: true
            }
        },
        _id: false,
        required: true
    })
    location: {
        full_address: string;
        house_no?: string;
        village?: string;
        moo?: string;
        alley?: string;
        road?: string;
        province: string;
        district?: string;
        sub_district?: string;
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
        ig?: {name:string, link:string};
        website?: string;
    }

    @Prop({ type: String })
    slug: string;

    @Prop({ type: Date })
    created_at: Date;

    @Prop({ type: Date })
    updated_at: Date;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);

CommunitySchema.index({ slug: 1 }, { unique: true })
CommunitySchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });

// relation จาก COMMUNITY_ADMIN, EVENTS, USERS, SHOP, WORKSHOP table ที่จะอ้างอิงมาหา (รอสร้าง)
// CommunitySchema.virtual('shops', {
//     ref: 'Shop',
//     localField: '_id',
//     foreignField: 'community'
// })

CommunitySchema.virtual('events', {
    ref: 'Event',
    localField: '_id',
    foreignField: 'community'
})

CommunitySchema.virtual('workshops', {
    ref: 'WorkShop',
    localField: '_id',
    foreignField: 'community'
})

CommunitySchema.virtual('admin', {
    ref: 'Admin',
    localField: '_id',
    foreignField: 'community'
})