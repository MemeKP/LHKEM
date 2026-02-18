import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkshopregistrationsService } from './workshopregistrations.service';
import { WorkshopregistrationsController } from './workshopregistrations.controller';
import { Workshopregistration, WorkshopregistrationSchema } from './schemas/workshopregistration.schema';

@Module({
  imports: [
    /* Injecting the Mongoose model into this module scope */
    MongooseModule.forFeature([
      { name: Workshopregistration.name, schema: WorkshopregistrationSchema }
    ])
  ],
  controllers: [WorkshopregistrationsController],
  providers: [WorkshopregistrationsService],
})
export class WorkshopregistrationsModule {}