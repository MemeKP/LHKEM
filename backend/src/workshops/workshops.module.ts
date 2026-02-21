import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';
import { Workshop, WorkshopSchema } from './schemas/workshop.schema';

@Module({
  imports: [
    /* Binds the Workshop schema to the Mongoose model for this module */
    MongooseModule.forFeature([{ name: Workshop.name, schema: WorkshopSchema }])
  ],
  exports: [MongooseModule],
  controllers: [WorkshopsController],
  providers: [WorkshopsService],
})
export class WorkshopsModule {}