import { Module } from '@nestjs/common';
import { CommunityMapService } from './community-map.service';
import { CommunityMapController } from './community-map.controller';
import { MapPinSchema } from './schemas/map-pin.schema';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { CommunityMapSchema } from './schemas/community-map.schema';
import { CommunityMap } from './schemas/community-map.schema';
import { MapPin } from './schemas/map-pin.schema';
import { WorkshopSchema } from 'src/workshops/schemas/workshop.schema';
import { Shop, ShopSchema } from 'src/shops/schemas/shop.schema';
import { EventSchema } from 'src/events/schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommunityMap.name, schema: CommunityMapSchema },
      { name: MapPin.name, schema: MapPinSchema },
      {name : Shop.name, schema: ShopSchema},
    ]),
  ],
  providers: [CommunityMapService],
  controllers: [CommunityMapController]
})
export class CommunityMapModule {}
