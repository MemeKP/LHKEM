import { Injectable } from '@nestjs/common';
import { CreateCommunityViewDto } from './dto/create-community-view.dto';
import { UpdateCommunityViewDto } from './dto/update-community-view.dto';

@Injectable()
export class CommunityViewService {
  create(createCommunityViewDto: CreateCommunityViewDto) {
    return 'This action adds a new communityView';
  }

  findAll() {
    return `This action returns all communityView`;
  }

  findOne(id: number) {
    return `This action returns a #${id} communityView`;
  }

  update(id: number, updateCommunityViewDto: UpdateCommunityViewDto) {
    return `This action updates a #${id} communityView`;
  }

  remove(id: number) {
    return `This action removes a #${id} communityView`;
  }
}
