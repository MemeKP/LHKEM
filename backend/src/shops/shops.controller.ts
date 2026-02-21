import {
  BadRequestException,
  Body,
  Controller,
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
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

const shopImageStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'shops');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const randomName = randomBytes(8).toString('hex');
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@Controller('api/shops')
export class ShopController {
  constructor(private readonly shopService: ShopsService) {}

  //create shop
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  @Post()
  create(@Req() req, @Body() dto: CreateShopDto) {
    return this.shopService.create(req.user.userMongoId, dto);
  }

  //get my shop
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  @Get('me')
  findMine(@Req() req) {
    return this.shopService.findMyShop(req.user.userMongoId);
  }

  //update shop
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  @Put(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopService.update(id, req.user.userMongoId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  @Post(':id/images/:field')
  @UseInterceptors(FileInterceptor('file', { storage: shopImageStorage }))
  uploadShopImage(
    @Req() req,
    @Param('id') id: string,
    @Param('field') field: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const normalizedField = field?.toLowerCase();
    if (!['cover', 'icon'].includes(normalizedField)) {
      throw new BadRequestException('Invalid image field');
    }
    return this.shopService.updateShopImage(
      id,
      req.user.userMongoId,
      normalizedField as 'cover' | 'icon',
      `/uploads/shops/${file.filename}`,
    );
  }

  //get public shop info
  @Get(':id')
  findPublic(@Param('id') id: string) {
    return this.shopService.findPublic(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @Get(':id/admin')
  findAdmin(@Param('id') id: string) {
    return this.shopService.findByIdAdmin(id);
  }

  @Get('/community/:id')
  findByCommunity(@Param('id') id: string) {
    return this.shopService.findByCommunity(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @Get('/community/:id/all')
  findAllForCommunity(@Param('id') id: string) {
    return this.shopService.findAllByCommunity(id);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @Get('/community/:id/pending')
  findPending(@Param('id') id: string) {
    return this.shopService.findPendingByCommunity(id);
  }

  // shop.controller.ts
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @Put(':id/approve')
  approve(@Param('id') id: string) {
    return this.shopService.approveShop(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PLATFORM_ADMIN)
  @Put(':id/reject')
  reject(@Param('id') id: string) {
    return this.shopService.rejectShop(id);
  }


}
