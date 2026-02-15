import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { PlatformAdminService } from './platform-admin.service';
import { CreatePlatformAdminDto } from './dto/create-platform-admin.dto';
import { UpdatePlatformAdminDto } from './dto/update-platform-admin.dto';
import { PlatformDashboardResponseDto } from './dto/platform-dashboard.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommunityDetailResponseDto } from './dto/community-detail.dto';

@Controller('api/platform-admin')
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) { }

  @Get('dashboard')
  async getDashboard(): Promise<PlatformDashboardResponseDto> {
    return this.platformAdminService.getDashboardData();
  }
  // @Post()
  // create(@Body() createPlatformAdminDto: CreatePlatformAdminDto) {
  //   return this.platformAdminService.create(createPlatformAdminDto);
  // }

  // @Get()
  // findAll() {
  //   return this.platformAdminService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.platformAdminService.findOne(+id);
  // }
  @Get('communities/:id')
  async getCommunityDetail(
    @Param('id') id: string,
  ): Promise<CommunityDetailResponseDto> {
    return this.platformAdminService.getCommunityDetail(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePlatformAdminDto: UpdatePlatformAdminDto) {
  //   return this.platformAdminService.update(+id, updatePlatformAdminDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.platformAdminService.remove(+id);
  // }
}
