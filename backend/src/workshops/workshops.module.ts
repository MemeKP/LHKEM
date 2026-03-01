import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';
import { Workshop, WorkshopSchema } from './schemas/workshop.schema';

@Module({
  // Register the schema here so this module can read from the DB
  imports: [MongooseModule.forFeature([{ name: Workshop.name, schema: WorkshopSchema }])],
  controllers: [WorkshopsController],
  providers: [WorkshopsService],
})
export class WorkshopsModule {}