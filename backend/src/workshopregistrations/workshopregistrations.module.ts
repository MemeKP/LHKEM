import { Module } from '@nestjs/common';
import { WorkshopregistrationsService } from './workshopregistrations.service';
import { WorkshopregistrationsController } from './workshopregistrations.controller';

@Module({
  controllers: [WorkshopregistrationsController],
  providers: [WorkshopregistrationsService],
})
export class WorkshopregistrationsModule {}
