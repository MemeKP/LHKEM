import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommunityViewService } from './community-view.service';
import { CreateCommunityViewDto } from './dto/create-community-view.dto';
import { UpdateCommunityViewDto } from './dto/update-community-view.dto';

@Controller('community-view')
export class CommunityViewController {
  constructor(private readonly communityViewService: CommunityViewService) {}

  @Post()
  create(@Body() createCommunityViewDto: CreateCommunityViewDto) {
    return this.communityViewService.create(createCommunityViewDto);
  }

  @Get()
  findAll() {
    return this.communityViewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityViewService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityViewDto: UpdateCommunityViewDto) {
    return this.communityViewService.update(+id, updateCommunityViewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityViewService.remove(+id);
  }
}
