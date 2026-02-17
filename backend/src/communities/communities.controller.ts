import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { ParseFilePipe } from '@nestjs/common';

@Controller('api/communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) { }

  // @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.PLATFORM_ADMIN)
  // create(@Body() createCommunityDto: CreateCommunityDto) {
  //   return this.communitiesService.create(createCommunityDto);
  // }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  @UseInterceptors(
    FileInterceptor('images', {
      storage: diskStorage({
        destination: './uploads/communities',
        filename: (req, file, cb) => {
          const randomName = randomBytes(16).toString('hex');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Req() req: any,
    @Body() createCommunityDto: CreateCommunityDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (file) {
      createCommunityDto.images = [
        `/uploads/communities/${file.filename}`,
      ];
    }
    if (typeof createCommunityDto.contact_info === 'string') {
      createCommunityDto.contact_info = JSON.parse(createCommunityDto.contact_info);
    }
    if (typeof createCommunityDto.admins === 'string') {
      createCommunityDto.admins = JSON.parse(createCommunityDto.admins);
    }
    return this.communitiesService.create(req.user.userMongoId, createCommunityDto);
  }

  @Get()
  findAll() {
    return this.communitiesService.findAll();
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.communitiesService.findByIdOrSlug(idOrSlug);
  }

  @Get(':id/media')
  getMedia(@Param('id') id: string) {
    return this.communitiesService.getMedia(id);
  }

  @Get(':id/map')
  getMapData(@Param('id') id: string) {
    return this.communitiesService.getMapData(id);
  }

  @Get(':id/workshops')
  getWorkshopsPreview(@Param('id') id: string, @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 3,) {
    return this.communitiesService.getWorkshopsPreview(id, limit);
  }

  @Get(':id/dashboard')
  getDashboardStats(@Param('id') id: string) {
    return this.communitiesService.getDashboardStats(id);
  }

  @Get(':id/shops')
  getShops(@Param('id') id: string) {
    return this.communitiesService.getShops(id);
  }

  @Get(':id/stats')
  getChartStats(@Param('id') id: string) {
    return this.communitiesService.getChartStats(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityDto: UpdateCommunityDto) {
    return this.communitiesService.update(id, updateCommunityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communitiesService.remove(id);
  }

  @Patch(':id/close') 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN) 
  async closeCommunity(@Param('id') id: string) {
    return this.communitiesService.close(id);
  }

}