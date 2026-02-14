import { Module } from '@nestjs/common';
import { PlatformAdminService } from './platform-admin.service';
import { PlatformAdminController } from './platform-admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from 'src/communities/schemas/community.schema';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { PlatformActivity, PlatformActivitySchema } from './schemas/platform-activity.schema';
import { EventSchema } from 'src/events/schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
      { name: User.name, schema: UserSchema },
      { name: PlatformActivity.name, schema: PlatformActivitySchema},
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService],
})
export class PlatformAdminModule {}
