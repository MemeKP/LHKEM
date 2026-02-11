import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopregistrationsController } from './workshopregistrations.controller';
import { WorkshopregistrationsService } from './workshopregistrations.service';

describe('WorkshopregistrationsController', () => {
  let controller: WorkshopregistrationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkshopregistrationsController],
      providers: [WorkshopregistrationsService],
    }).compile();

    controller = module.get<WorkshopregistrationsController>(WorkshopregistrationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
