import { Module } from '@nestjs/common';
import { CommunityAdminService } from './community-admin.service';
import { CommunityAdminController } from './community-admin.controller';

@Module({
  controllers: [CommunityAdminController],
  providers: [CommunityAdminService],
})
export class CommunityAdminModule {}
