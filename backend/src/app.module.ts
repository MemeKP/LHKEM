import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CommunitiesModule } from './communities/communities.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { ShopsModule } from './shops/shops.module';
import { WorkshopregistrationsModule } from './workshopregistrations/workshopregistrations.module';
import { CommunityAdminModule } from './community-admin/community-admin.module';
import { CommunityMapModule } from './community-map/community-map.module';
import { PlatformAdminModule } from './platform-admin/platform-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URL!,
    ),
    UsersModule,
    CommunitiesModule,
    EventsModule,
    AuthModule,
    WorkshopsModule,
    ShopsModule,
    WorkshopregistrationsModule,
    CommunityAdminModule,
    CommunityMapModule,
    PlatformAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }