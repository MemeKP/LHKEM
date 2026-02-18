import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { CommunityAdmin, CommunityAdminSchema } from 'src/community-admin/schemas/community-admin.schema';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Event.name, schema: EventSchema },
        { name: CommunityAdmin.name, schema: CommunityAdminSchema },
      ])
    ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
