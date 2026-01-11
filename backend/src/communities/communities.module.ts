import { Module } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from './schemas/community.schema';
import { Workshop, WorkshopSchema } from 'src/workshops/schemas/workshop.schema';
import { Shop, ShopSchema } from 'src/shops/schemas/shop.schema';
import { Workshopregistration, WorkshopregistrationSchema } from 'src/workshopregistrations/schemas/workshopregistration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
      { name: Workshop.name, schema: WorkshopSchema },
      { name: Shop.name, schema: ShopSchema },
      { name: Workshopregistration.name, schema: WorkshopregistrationSchema },
    ])
  ],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
  exports: [CommunitiesService]
})
export class CommunitiesModule {}
