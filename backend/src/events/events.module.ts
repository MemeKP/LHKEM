import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { CommunityAdmin, CommunityAdminSchema } from 'src/community-admin/schemas/community-admin.schema';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { Workshop, WorkshopSchema } from 'src/workshops/schemas/workshop.schema';
import { Shop, ShopSchema } from 'src/shops/schemas/shop.schema';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { Community, CommunitySchema } from 'src/communities/schemas/community.schema';
import { CommunityView, CommunityViewSchema } from 'src/community-view/schemas/community-view.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: CommunityAdmin.name, schema: CommunityAdminSchema },
      { name: Workshop.name, schema: WorkshopSchema },
      { name: Shop.name, schema: ShopSchema },
      { name: User.name, schema: UserSchema },
      { name: Community.name, schema: CommunitySchema },
      { name: CommunityView.name, schema: CommunityViewSchema },


    ])
  ],
  exports: [MongooseModule],
  controllers: [EventsController],
  providers: [EventsService, DashboardService],
})
export class EventsModule { }
