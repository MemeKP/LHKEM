import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Community, CommunityDocument } from '../communities/schemas/community.schema';
import { seedCommunity } from './community.seed';
import { Model } from 'mongoose';
import { CommunitiesService } from 'src/communities/communities.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const communityModel = app.get<Model<CommunityDocument>>(getModelToken(Community.name));
  const communityService = app.get(CommunitiesService);
  const community = await seedCommunity(communityModel, communityService);
  await app.close();
}

bootstrap();
