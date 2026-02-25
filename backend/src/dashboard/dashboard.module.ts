import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventSchema } from "src/events/schemas/event.schema";
import { Shop, ShopSchema } from "src/shops/schemas/shop.schema";
import { Workshop, WorkshopSchema } from "src/workshops/schemas/workshop.schema";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from './dashboard.controller';
import { User, UserSchema } from "src/users/schemas/users.schema";
import { Community, CommunitySchema } from "src/communities/schemas/community.schema";
import { CommunityView, CommunityViewSchema } from "src/community-view/schemas/community-view.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Workshop.name, schema: WorkshopSchema },
      { name: Shop.name, schema: ShopSchema },
      { name: User.name, schema: UserSchema },
      { name: Community.name, schema: CommunitySchema },
      { name: CommunityView.name, schema: CommunityViewSchema },

    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}