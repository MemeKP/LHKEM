import { Test, TestingModule } from '@nestjs/testing';
import { CommunityMapService } from './community-map.service';

describe('CommunityMapService', () => {
  let service: CommunityMapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityMapService],
    }).compile();

    service = module.get<CommunityMapService>(CommunityMapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
