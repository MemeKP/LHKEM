import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Community, CommunityDocument } from '../communities/schemas/community.schema';
import { seedCommunity } from './community.seed';
import { Model } from 'mongoose';
import { CommunitiesService } from 'src/communities/communities.service';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { CommunityMap } from 'src/community-map/schemas/community-map.schema';
import { seedPlatformAdmin } from './admin.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const communityModel = app.get<Model<CommunityDocument>>(getModelToken(Community.name));
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const communityMapModel = app.get<Model<CommunityMap & Document>>(getModelToken(CommunityMap.name));
  const communityService = app.get(CommunitiesService);

  const community = await seedCommunity(communityModel, communityService);
  await seedPlatformAdmin(userModel);

  await app.close();
}

bootstrap();
