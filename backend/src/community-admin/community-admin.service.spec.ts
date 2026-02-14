import { Test, TestingModule } from '@nestjs/testing';
import { CommunityAdminService } from './community-admin.service';

describe('CommunityAdminService', () => {
  let service: CommunityAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityAdminService],
    }).compile();

    service = module.get<CommunityAdminService>(CommunityAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
