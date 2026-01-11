import { SchemaFactory } from "@nestjs/mongoose";

export type ShopDocument = Shop & Document;

export class Shop {

}
export const ShopSchema = SchemaFactory.createForClass(Shop);
