import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards } from '@nestjs/common';
import { PlatformAdminService } from './platform-admin.service';
import { CreatePlatformAdminDto } from './dto/create-platform-admin.dto';
import { UpdatePlatformAdminDto } from './dto/update-platform-admin.dto';
import { PlatformDashboardResponseDto } from './dto/platform-dashboard.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommunityDetailResponseDto } from './dto/community-detail.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

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

  @Get('communities/:id/for-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  async findOneForUpdate(@Param('id') id: string) {
    return this.platformAdminService.getCommunityForUpdate(id);
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
