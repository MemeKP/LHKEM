import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommunityAdminService } from './community-admin.service';
import { CreateCommunityAdminDto } from './dto/create-community-admin.dto';
import { UpdateCommunityAdminDto } from './dto/update-community-admin.dto';

@Controller('community-admin')
export class CommunityAdminController {
  constructor(private readonly communityAdminService: CommunityAdminService) {}

  @Post()
  create(@Body() createCommunityAdminDto: CreateCommunityAdminDto) {
    return this.communityAdminService.create(createCommunityAdminDto);
  }

  @Get()
  findAll() {
    return this.communityAdminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityAdminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityAdminDto: UpdateCommunityAdminDto) {
    return this.communityAdminService.update(+id, updateCommunityAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityAdminService.remove(+id);
  }
}
