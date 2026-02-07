import { Test, TestingModule } from '@nestjs/testing';
import { CommunityAdminController } from './community-admin.controller';
import { CommunityAdminService } from './community-admin.service';

describe('CommunityAdminController', () => {
  let controller: CommunityAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityAdminController],
      providers: [CommunityAdminService],
    }).compile();

    controller = module.get<CommunityAdminController>(CommunityAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
