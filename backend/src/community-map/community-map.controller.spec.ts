import { Test, TestingModule } from '@nestjs/testing';
import { CommunityMapController } from './community-map.controller';

describe('CommunityMapController', () => {
  let controller: CommunityMapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityMapController],
    }).compile();

    controller = module.get<CommunityMapController>(CommunityMapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
