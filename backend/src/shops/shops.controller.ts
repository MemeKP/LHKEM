import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/shops')
export class ShopController {
  constructor(private readonly shopService: ShopsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  @Post()
  create(@Req() req, @Body() dto: CreateShopDto) {
    return this.shopService.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  @Get('me')
  findMine(@Req() req) {
    return this.shopService.findMyShop(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP)
  @Put(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopService.update(id, req.user.userId, dto);
  }

  @Get(':id')
  findPublic(@Param('id') id: string) {
    return this.shopService.findPublic(id);
  }

  @Get('/community/:id')
  findByCommunity(@Param('id') id: string) {
    return this.shopService.findByCommunity(id);
  }

  // shop.controller.ts
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('/community/:id/pending')
  findPending(@Param('id') id: string) {
    return this.shopService.findPendingByCommunity(id);
  }

  // shop.controller.ts
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/approve')
  approve(@Param('id') id: string) {
    return this.shopService.approveShop(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/reject')
  reject(@Param('id') id: string) {
    return this.shopService.rejectShop(id);
  }


}
