import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
<<<<<<< HEAD
import { CommunitiesModule } from './communities/communities.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
=======
import { AuthModule } from './auth/auth.module';
>>>>>>> debac8da363ce4f38788a4ba32c8ed04a962a8fc

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URL!,
    ),
    UsersModule,
<<<<<<< HEAD
    CommunitiesModule,
    EventsModule,
    AdminModule,
=======
    AuthModule,
>>>>>>> debac8da363ce4f38788a4ba32c8ed04a962a8fc
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
