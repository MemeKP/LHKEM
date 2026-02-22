import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException, Query } from '@nestjs/common';
import { CommunityAdminService } from './community-admin.service';
import { CreateCommunityAdminDto } from './dto/create-community-admin.dto';
import { UpdateCommunityAdminDto } from './dto/update-community-admin.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { InjectModel } from '@nestjs/mongoose';
import { CommunityAdmin } from './schemas/community-admin.schema';
import { Model, Types } from 'mongoose';

@Controller('api/community-admin')
export class CommunityAdminController {
  constructor(
    private readonly communityAdminService: CommunityAdminService,
    private readonly dashboardService: DashboardService,
    @InjectModel(CommunityAdmin.name) private readonly communityAdminModel: Model<CommunityAdmin>
  ) { }
  @Post()
  create(@Body() createCommunityAdminDto: CreateCommunityAdminDto) {
    return this.communityAdminService.create(createCommunityAdminDto);
  }

  @Get('community-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCommunityStats(
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
    @Req() req,
  ) {
    const userId = req.user.userMongoId || req.user._id;
    const adminRecord = await this.communityAdminModel.findOne({
      user: new Types.ObjectId(userId),
    }).lean();

    if (!adminRecord) throw new ForbiddenException('You are not a community admin');

    return this.dashboardService.getCommunityOverviewStats(
      adminRecord.community.toString(),
      period,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getMyCommunityStats(
    @Req() req: any,
    @Query('timeRange') timeRange: string
  ) {
    const userId = req.user.userMongoId || req.user._id;

    const adminRecord = await this.communityAdminModel.findOne({
      user: new Types.ObjectId(userId)
    }).exec();

    if (!adminRecord) {
      throw new ForbiddenException('Not allow');
    }

    const communityId = adminRecord.community.toString();

    return this.dashboardService.getDashboardStats(communityId, timeRange);
  }

  @Get('workshop-by-category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getWorkshopsByCategory(
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
    @Req() req,
  ) {
    const userId = req.user.userMongoId || req.user._id;
    const adminRecord = await this.communityAdminModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();

    if (!adminRecord) throw new ForbiddenException('You are not a community admin');

    return this.dashboardService.getWorkshopsByCategory(
      adminRecord.community.toString(),
      period,
    );
  }

  @Get('top-workshops')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTopWorkshops(
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
    @Req() req,
  ) {
    const userId = req.user.userMongoId || req.user._id;
    const adminRecord = await this.communityAdminModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();

    if (!adminRecord) throw new ForbiddenException('You are not a community admin');

    return this.dashboardService.getTopWorkshops(
      adminRecord.community.toString(),
      period,
    );
  }

  @Get('workshop-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getWorkshopStatus(
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
    @Req() req,
  ) {
    const userId = req.user.userMongoId || req.user._id;
    const adminRecord = await this.communityAdminModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();

    if (!adminRecord) throw new ForbiddenException('You are not a community admin');

    return this.dashboardService.getWorkshopStatus(
      adminRecord.community.toString(),
      period,
    );
  }

  @Get('category-engagement')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCategoryEngagement(
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
    @Req() req,
  ) {
    const userId = req.user.userMongoId || req.user._id;
    const adminRecord = await this.communityAdminModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();

    if (!adminRecord) throw new ForbiddenException('You are not a community admin');

    return this.dashboardService.getCategoryEngagement(
      adminRecord.community.toString(),
      period,
    );
  }

  @Get('community-growth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCommunityGrowth(@Req() req) {
    const userId = req.user.userMongoId || req.user._id;
    const adminRecord = await this.communityAdminModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();

    if (!adminRecord) throw new ForbiddenException('You are not a community admin');

    return this.dashboardService.getCommunityGrowth(adminRecord.community.toString());
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
