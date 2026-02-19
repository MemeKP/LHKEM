import { Module } from '@nestjs/common';
import { CommunityAdminService } from './community-admin.service';
import { CommunityAdminController } from './community-admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from 'src/communities/schemas/community.schema';
import { CommunityAdmin, CommunityAdminSchema } from './schemas/community-admin.schema';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Community.name, schema: CommunitySchema },
        { name: CommunityAdmin.name, schema: CommunityAdminSchema},
      ]),
    ],
  controllers: [CommunityAdminController],
  providers: [CommunityAdminService],
})
export class CommunityAdminModule {}
