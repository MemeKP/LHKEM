import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { EventSchema } from 'src/events/schemas/event.schema';
import { Workshop, WorkshopSchema } from 'src/workshops/schemas/workshop.schema';
import { Shop, ShopSchema } from 'src/shops/schemas/shop.schema';
import { Community, CommunitySchema } from 'src/communities/schemas/community.schema';
import { DashboardModule } from 'src/dashboard/dashboard.module';

@Module({
  imports: [
    DashboardModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Event.name, schema: EventSchema },
      { name: Workshop.name, schema: WorkshopSchema },
      { name: Shop.name, schema: ShopSchema },
      { name: Community.name, schema: CommunitySchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
