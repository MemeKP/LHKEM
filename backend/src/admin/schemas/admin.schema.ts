import { SchemaFactory } from "@nestjs/mongoose";

export type AdminDocument = Admin & Document;

export class Admin {

}

export const AdminSchema = SchemaFactory.createForClass(Admin)
