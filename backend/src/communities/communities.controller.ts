import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, UseInterceptors, Req, UploadedFiles } from '@nestjs/common';

import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { ParseFilePipe } from '@nestjs/common';

@Controller('api/communities')
export class CommunitiesController {
  constructor(
    private readonly communitiesService: CommunitiesService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
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
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (typeof createCommunityDto.contact_info === 'string') {
      createCommunityDto.contact_info = JSON.parse(createCommunityDto.contact_info);
    }
    if (typeof createCommunityDto.admins === 'string') {
      createCommunityDto.admins = JSON.parse(createCommunityDto.admins);
    }
    if (typeof createCommunityDto.image_slots === 'string') {
      try {
        createCommunityDto.image_slots = JSON.parse(createCommunityDto.image_slots);
      } catch (error) {
        createCommunityDto.image_slots = [];
      }
    }

    const uploadedPaths = (files || []).map(
      (file) => `/uploads/communities/${file.filename}`,
    );
    if (Array.isArray(createCommunityDto.image_slots) && createCommunityDto.image_slots.length > 0) {
      const finalImages: string[] = [];
      let fileIndex = 0;
      createCommunityDto.image_slots.forEach((slot) => {
        if (typeof slot === 'string' && slot.startsWith('__file__')) {
          const nextImage = uploadedPaths[fileIndex++];
          if (nextImage) {
            finalImages.push(nextImage);
          }
        } else if (typeof slot === 'string' && slot.trim() !== '') {
          finalImages.push(slot);
        }
      });
      if (finalImages.length > 0) {
        createCommunityDto.images = finalImages;
      }
    } else if (uploadedPaths.length > 0) {
      createCommunityDto.images = uploadedPaths;
    }
    delete createCommunityDto.image_slots;
    return this.communitiesService.create(req.user.userMongoId, createCommunityDto);
  }

  @Get('my-community')
  @UseGuards(JwtAuthGuard)
  async findMyCommunity(@Req() req: any) {
    const userId = req.user.userMongoId || req.user._id; 
    return this.communitiesService.findMyCommunity(userId);
  }

  @Get()
  findAll() {
    return this.communitiesService.findAll();
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string, @Req() req) {
    const userId = req.user?.userMongoId || req.user?._id || null;
    return this.communitiesService.findByIdOrSlug(idOrSlug, userId);
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

  @Post(':id/admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  async addAdminToCommunity(
    @Param('id') id: string,
    @Body('email') email: string,
    @Req() req: any,
  ) {
    return this.communitiesService.addAdminByEmail(id, email, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ADMIN)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/communities',
        filename: (req, file, cb) => {
          const randomName = randomBytes(16).toString('hex');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateCommunityDto: UpdateCommunityDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req,
  ) {

    if (typeof updateCommunityDto.location === 'string') {
      updateCommunityDto.location = JSON.parse(updateCommunityDto.location);
    }

    if (typeof updateCommunityDto.contact_info === 'string') {
      updateCommunityDto.contact_info = JSON.parse(updateCommunityDto.contact_info);
    }

    if (typeof updateCommunityDto.hero_section === 'string') {
      updateCommunityDto.hero_section = JSON.parse(updateCommunityDto.hero_section);
    }

    if (typeof updateCommunityDto.admins === 'string') {
      updateCommunityDto.admins = JSON.parse(updateCommunityDto.admins);
    }

    if (typeof updateCommunityDto.image_slots === 'string') {
      try {
        updateCommunityDto.image_slots = JSON.parse(updateCommunityDto.image_slots);
      } catch (error) {
        updateCommunityDto.image_slots = [];
      }
    }
    if (updateCommunityDto.existing_images && typeof updateCommunityDto.existing_images === 'string') {
      updateCommunityDto.existing_images = [updateCommunityDto.existing_images];
    }
    const uploadedPaths = (files || []).map(
      (file) => `/uploads/communities/${file.filename}`,
    );
    if (Array.isArray(updateCommunityDto.image_slots) && updateCommunityDto.image_slots.length > 0) {
      const finalImages: string[] = [];
      let fileIndex = 0;
      updateCommunityDto.image_slots.forEach((slot) => {
        if (typeof slot === 'string' && slot.startsWith('__file__')) {
          const nextImage = uploadedPaths[fileIndex++];
          if (nextImage) {
            finalImages.push(nextImage);
          }
        } else if (typeof slot === 'string' && slot.trim() !== '') {
          finalImages.push(slot);
        }
      });
      if (finalImages.length > 0) {
        updateCommunityDto.images = finalImages;
      }
    } else if (uploadedPaths.length > 0) {
      updateCommunityDto.images = uploadedPaths;
    }
    delete updateCommunityDto.image_slots;
    const mongoId = req.user.userMongoId || req.user._id;
    const userRole = req.user.role;
    return this.communitiesService.update(id, mongoId, userRole, updateCommunityDto, files);
  }

  @Delete(':id/admins/:adminId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  async removeAdminFromCommunity(
    @Param('id') community_id: string,
    @Param('adminId') adminId: string,
  ) {
    return this.communitiesService.removeAdmin(community_id, adminId);
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