import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { CommunityMapService } from './community-map.service';
import { CreateMapPinDto } from './dto/create-map-pin.dto';
import { UpdateMapPinDto } from './dto/update-map-pin.dto';


@Controller()
export class CommunityMapController {
  constructor(
    private readonly communityMapService: CommunityMapService,
  ) {}

  // =====================================================
  // USER SIDE
  // =====================================================

  /**
   * GET community map + pins
   * ใช้ฝั่ง user ดูแผนที่
   */
  @Get('/api/communities/:communityId/communitymap')
  async getCommunityMap(
    @Param('communityId') communityId: string,
  ) {
    return this.communityMapService.getCommunityMap(communityId);
  }

  /**
   * GET pin detail
   * ใช้ตอน user คลิกหมุด
   */
  @Get('/api/map/pins/:pinId')
  async getPinDetail(
    @Param('pinId') pinId: string,
  ) {
    return this.communityMapService.getPinDetail(pinId);
  }

  // =====================================================
  // ADMIN SIDE
  // =====================================================

  /**
   * Upload / Update community map image
   * multipart/form-data
   * key = file
   */
  @Post('/api/admin/communities/:communityId/map')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCommunityMap(
    @Param('communityId') communityId: string,
    @UploadedFile() file: Multer.File,
  ) {
    const imageUrl = `/uploads/maps/${file.filename}`;

    return this.communityMapService.uploadMap(
      communityId,
      imageUrl,
    );
  }

  /**
   * Create new pin on map
   */
  @Post('/api/admin/communities/:communityId/map/pins')
  async createMapPin(
    @Param('communityId') communityId: string,
    @Body() dto: CreateMapPinDto,
  ) {
    return this.communityMapService.createPin(
      communityId,
      dto,
    );
  }

  /**
   * Update pin position (drag & drop)
   */
  @Put('/api/admin/map/pins/:pinId')
  async updateMapPin(
    @Param('pinId') pinId: string,
    @Body() dto: UpdateMapPinDto,
  ) {
    return this.communityMapService.updatePin(
      pinId,
      dto,
    );
  }

  /**
   * Delete pin
   */
  @Delete('/api/admin/map/pins/:pinId')
  async deleteMapPin(
    @Param('pinId') pinId: string,
  ) {
    return this.communityMapService.deletePin(pinId);
  }
}
