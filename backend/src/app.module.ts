import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
<<<<<<< HEAD
import { ConfigModule, ConfigService } from '@nestjs/config';
=======
import { ConfigModule } from '@nestjs/config';
>>>>>>> 9b2f5d036ec71aa346858bbe475bbd04be5898d9
import { CommunitiesModule } from './communities/communities.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URL');
        return {
          uri: uri || 'mongodb://localhost:27017/lhkem',
        };
      },
    }),
    UsersModule,
    CommunitiesModule,
    EventsModule,
    AdminModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
