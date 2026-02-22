import { Module } from '@nestjs/common';
import { CommunityViewService } from './community-view.service';
import { CommunityViewController } from './community-view.controller';

@Module({
  controllers: [CommunityViewController],
  providers: [CommunityViewService],
})
export class CommunityViewModule {}
