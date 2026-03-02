import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkshopregistrationsService } from './workshopregistrations.service';
import { WorkshopregistrationsController } from './workshopregistrations.controller';
import { Workshopregistration, WorkshopregistrationSchema } from './schemas/workshopregistration.schema';
import { Workshop, WorkshopSchema } from '../workshops/schemas/workshop.schema';
import { Shop, ShopSchema } from '../shops/schemas/shop.schema';

@Module({
  imports: [
    /* Injecting the Mongoose model into this module scope */
    MongooseModule.forFeature([
      { name: Workshopregistration.name, schema: WorkshopregistrationSchema },
      { name: Workshop.name, schema: WorkshopSchema },
      { name: Shop.name, schema: ShopSchema },
    ])
  ],
  controllers: [WorkshopregistrationsController],
  providers: [WorkshopregistrationsService],
})
export class WorkshopregistrationsModule {}