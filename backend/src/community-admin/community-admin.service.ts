import { Injectable } from '@nestjs/common';
import { CreateCommunityAdminDto } from './dto/create-community-admin.dto';
import { UpdateCommunityAdminDto } from './dto/update-community-admin.dto';

@Injectable()
export class CommunityAdminService {
  create(createCommunityAdminDto: CreateCommunityAdminDto) {
    return 'This action adds a new communityAdmin';
  }

  findAll() {
    return `This action returns all communityAdmin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} communityAdmin`;
  }

  update(id: number, updateCommunityAdminDto: UpdateCommunityAdminDto) {
    return `This action updates a #${id} communityAdmin`;
  }

  remove(id: number) {
    return `This action removes a #${id} communityAdmin`;
  }
}
