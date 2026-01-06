import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Community, CommunityDocument } from '../communities/schemas/community.schema';
import { seedCommunity } from './community.seed';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const communityModel = app.get<Model<CommunityDocument>>(getModelToken(Community.name));
  const community = await seedCommunity(communityModel);
  await app.close();
}

bootstrap();
