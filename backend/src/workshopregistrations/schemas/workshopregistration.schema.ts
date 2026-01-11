import { SchemaFactory } from "@nestjs/mongoose";

export type WorkshopregistrationDocument = Workshopregistration & Document;

export class Workshopregistration {

}

export const WorkshopregistrationSchema = SchemaFactory.createForClass(Workshopregistration);
