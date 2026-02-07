import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document, Types } from 'mongoose';
import { UserRole } from 'src/common/enums/user-role.enum';

export type UserDocument = User & Document;


@Schema({ timestamps: true, collection: 'users' })
export class User {
    @Prop({ unique: true }) //backend สร้าง user_id เอง
    user_id: string;

    @Prop({ required: true })
    firstname: string;

    @Prop({ required: true })
    lastname: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ required: true, unique: true, lowercase: true })
    email: string;

    @Prop()
    phone: string;

    @Prop({ type: Date, default: Date.now })
    created_at: Date;

    @Prop({ enum: UserRole, default: UserRole.TOURIST })
    role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
