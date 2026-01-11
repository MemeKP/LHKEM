import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopregistrationsService } from './workshopregistrations.service';

describe('WorkshopregistrationsService', () => {
  let service: WorkshopregistrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkshopregistrationsService],
    }).compile();

    service = module.get<WorkshopregistrationsService>(WorkshopregistrationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
