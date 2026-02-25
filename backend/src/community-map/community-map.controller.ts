// src/community-map/community-map.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import type { Multer } from 'multer';
import { CommunityMapService } from './community-map.service';
import { CreateMapPinDto } from './dto/create-map-pin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { BadRequestException } from '@nestjs/common';

const mapStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'maps');
    // Ensure directory exists
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const randomName = randomBytes(6).toString('hex');
    const fileExt = extname(file.originalname);
    cb(null, `${randomName}${fileExt}`);
  },
});

@Controller()
export class CommunityMapController {
  constructor(
    private readonly communityMapService: CommunityMapService,
  ) {}

  // =========================
  // PUBLIC
  // =========================
  @Get('/api/communities/:communityId/communitymap')
  async getCommunityMap(
    @Param('communityId') communityId: string,
  ) {
    return this.communityMapService.getCommunityMap(communityId);
  }
  // public pin detail (for map click)
@Get('/api/map-pins/:pinId/detail')
async getPinDetail(
  @Param('pinId') pinId: string,
) {
  return this.communityMapService.getPinDetail(pinId);
}


  // =========================
  // SHOP
  // =========================
  @Post('/api/shops/map-pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  async createOrUpdateShopPin(
    @Req() req,
    @Body() dto: CreateMapPinDto,
  ) {
    return this.communityMapService.createOrUpdateShopPin(
      req.user.userMongoId,
      dto,
    );
  }

  @Get('/api/shops/map-pin/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  async getMyShopPin(@Req() req) {
    return this.communityMapService.getShopPinByUser(
      req.user.userMongoId,
    );
  }

  // =========================
  // COMMUNITY ADMIN
  // =========================
  @Post('/api/admin/communities/:communityId/map')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: mapStorage }))
  async uploadCommunityMap(
    @Param('communityId') communityId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Map image is required');
    }

    return this.communityMapService.uploadMap(
      communityId,
      `/uploads/maps/${file.filename}`,
    );
  }

  @Get('/api/admin/communities/:communityId/map-pins/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  async getPendingPins(
    @Param('communityId') communityId: string,
  ) {
    return this.communityMapService.getPendingPins(
      communityId,
    );
  }

  @Put('/api/admin/map-pins/:pinId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  async approvePin(@Param('pinId') pinId: string) {
    return this.communityMapService.approvePin(pinId);
  }

  @Delete('/api/admin/map-pins/:pinId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  async deletePin(@Param('pinId') pinId: string) {
    return this.communityMapService.deletePin(pinId);
  }

  @Get('/api/admin/shop-pins/:shopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  async getShopPinForAdmin(@Param('shopId') shopId: string) {
    return this.communityMapService.getShopPinForAdmin(shopId);
  }
}