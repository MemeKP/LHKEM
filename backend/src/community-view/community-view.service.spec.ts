import { Test, TestingModule } from '@nestjs/testing';
import { CommunityViewService } from './community-view.service';

describe('CommunityViewService', () => {
  let service: CommunityViewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityViewService],
    }).compile();

    service = module.get<CommunityViewService>(CommunityViewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
