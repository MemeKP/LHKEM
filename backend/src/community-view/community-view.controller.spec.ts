import { Test, TestingModule } from '@nestjs/testing';
import { CommunityViewController } from './community-view.controller';
import { CommunityViewService } from './community-view.service';

describe('CommunityViewController', () => {
  let controller: CommunityViewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityViewController],
      providers: [CommunityViewService],
    }).compile();

    controller = module.get<CommunityViewController>(CommunityViewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
