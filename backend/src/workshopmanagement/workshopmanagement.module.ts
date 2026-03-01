import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkshopManagementController } from './workshopmanagement.controller';
import { WorkshopManagementService } from './workshopmanagement.service';
// Import the EXACT SAME schema from the workshops folder
import { Workshop, WorkshopSchema } from '../workshops/schemas/workshop.schema';
import { Workshopregistration, WorkshopregistrationSchema } from '../workshopregistrations/schemas/workshopregistration.schema';
import { User, UserSchema } from '../users/schemas/users.schema';

@Module({
  // Registering the same schema connects this module to the exact same MongoDB collection
  imports: [
    MongooseModule.forFeature([
      { name: Workshop.name, schema: WorkshopSchema },
      { name: Workshopregistration.name, schema: WorkshopregistrationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [WorkshopManagementController],
  providers: [WorkshopManagementService],
})
export class WorkshopManagementModule {}