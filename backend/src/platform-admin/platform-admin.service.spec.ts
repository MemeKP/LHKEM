import { Test, TestingModule } from '@nestjs/testing';
import { PlatformAdminService } from './platform-admin.service';

describe('PlatformAdminService', () => {
  let service: PlatformAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlatformAdminService],
    }).compile();

    service = module.get<PlatformAdminService>(PlatformAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
