import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CommunityAdminService } from './community-admin.service';
import { CreateCommunityAdminDto } from './dto/create-community-admin.dto';
import { UpdateCommunityAdminDto } from './dto/update-community-admin.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

@Controller('api/community-admin')
export class CommunityAdminController {
  constructor(private readonly communityAdminService: CommunityAdminService) { }

  @Post()
  create(@Body() createCommunityAdminDto: CreateCommunityAdminDto) {
    return this.communityAdminService.create(createCommunityAdminDto);
  }
 
  @Get('setting')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) 
  async findOneForUpdate(@Req() req) {
    const userId = req.user.userMongoId || req.user._id
    return this.communityAdminService.getCommunityForUpdate(userId);
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
