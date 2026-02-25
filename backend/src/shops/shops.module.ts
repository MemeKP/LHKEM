// src/shop/shop.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopsService } from './shops.service';
import { ShopController } from './shops.controller';
import { Shop, ShopSchema } from './schemas/shop.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }]),
  ],
  exports: [MongooseModule],
  controllers: [ShopController],
  providers: [ShopsService],
})
export class ShopsModule {}
