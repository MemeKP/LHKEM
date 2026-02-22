import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommunitiesModule } from './communities/communities.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { ShopsModule } from './shops/shops.module';
import { WorkshopregistrationsModule } from './workshopregistrations/workshopregistrations.module';
import { CommunityAdminModule } from './community-admin/community-admin.module';
import { CommunityMapModule } from './community-map/community-map.module';
import { PlatformAdminModule } from './platform-admin/platform-admin.module';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailModule } from './email/email.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DashboardService } from './dashboard/dashboard.service';
import { CommunityViewModule } from './community-view/community-view.module';

@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true,
    }), 
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), 
      serveRoot: '/uploads', 
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: 587,
          secure: false,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASSWORD'), 
          },
        },
        defaults: {
          from: configService.get('MAIL_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
      inject: [ConfigService],
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
    EmailModule,
    CommunityViewModule,
  ],
  controllers: [AppController],
  providers: [AppService, DashboardService],
})
export class AppModule { } 