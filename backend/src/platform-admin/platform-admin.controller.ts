import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlatformAdminService } from './platform-admin.service';
import { CreatePlatformAdminDto } from './dto/create-platform-admin.dto';
import { UpdatePlatformAdminDto } from './dto/update-platform-admin.dto';
import { PlatformDashboardResponseDto } from './dto/platform-dashboard.dto';

@Controller('api/platform-admin')
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePlatformAdminDto: UpdatePlatformAdminDto) {
  //   return this.platformAdminService.update(+id, updatePlatformAdminDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.platformAdminService.remove(+id);
  // }
}
