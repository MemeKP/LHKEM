import { Module } from '@nestjs/common';
import { CommunityAdminService } from './community-admin.service';
import { CommunityAdminController } from './community-admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from 'src/communities/schemas/community.schema';
import { CommunityAdmin, CommunityAdminSchema } from './schemas/community-admin.schema';
import { EventSchema } from 'src/events/schemas/event.schema';
import { Workshop, WorkshopSchema } from 'src/workshops/schemas/workshop.schema';
import { Shop, ShopSchema } from 'src/shops/schemas/shop.schema';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { CommunityView, CommunityViewSchema } from 'src/community-view/schemas/community-view.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Community.name, schema: CommunitySchema },
      { name: Workshop.name, schema: WorkshopSchema },
      { name: Shop.name, schema: ShopSchema },
      { name: CommunityAdmin.name, schema: CommunityAdminSchema },
      { name: User.name, schema: UserSchema },
      { name: CommunityView.name, schema: CommunityViewSchema },

    ]),
  ],
  controllers: [CommunityAdminController],
  providers: [CommunityAdminService, DashboardService],
})
export class CommunityAdminModule { }
