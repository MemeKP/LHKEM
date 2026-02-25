import { forwardRef, Module } from '@nestjs/common';
import { PlatformAdminService } from './platform-admin.service';
import { PlatformAdminController } from './platform-admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from 'src/communities/schemas/community.schema';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { PlatformActivity, PlatformActivitySchema } from './schemas/platform-activity.schema';
import { EventSchema } from 'src/events/schemas/event.schema';
import { Shop, ShopSchema } from 'src/shops/schemas/shop.schema';
import { Workshop, WorkshopSchema } from 'src/workshops/schemas/workshop.schema';
import { CommunityAdmin, CommunityAdminSchema } from 'src/community-admin/schemas/community-admin.schema';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { CommunityView, CommunityViewSchema } from 'src/community-view/schemas/community-view.schema';

@Module({
  imports: [
    DashboardModule,
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
      { name: User.name, schema: UserSchema },
      { name: PlatformActivity.name, schema: PlatformActivitySchema},
      { name: Event.name, schema: EventSchema },
      { name: Shop.name, schema: ShopSchema},
      { name: Workshop.name, schema: WorkshopSchema}, 
      { name: CommunityAdmin.name, schema: CommunityAdminSchema},
      { name: CommunityView.name, schema: CommunityViewSchema },
    ]),
  ],
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService, DashboardService],
})
export class PlatformAdminModule {}
