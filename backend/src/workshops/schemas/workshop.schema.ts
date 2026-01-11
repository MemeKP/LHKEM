import { SchemaFactory } from "@nestjs/mongoose";

export type WorkshopDocument = Workshop & Document;

export class Workshop {

}

export const WorkshopSchema = SchemaFactory.createForClass(Workshop);
