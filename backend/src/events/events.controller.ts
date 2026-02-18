import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, BadRequestException, ForbiddenException, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { CommunityAdmin } from 'src/community-admin/schemas/community-admin.schema';
import { Model, Types } from 'mongoose';
interface JwtPayload {
  userId: string;
  role: string;
  email: string;
  community_id: string;
}

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService,
    @InjectModel(CommunityAdmin.name) private communityAdminModel: Model<CommunityAdmin>
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() req: Request & { user: JwtPayload }
  ) {
    const user = req.user;
    const targetCommunityId = user.community_id || '6952c7d7a6db8eb05e1908ed';
    if (!targetCommunityId) {
      throw new BadRequestException('User does not belong to any community');
    }
    return this.eventsService.create(
      createEventDto,
      user.userId,
      user.role,
      targetCommunityId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async findPending(@Req() req) {
    return this.eventsService.findPending(req.user.community_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findAll(
    @Req() req: any,
    @Query('community_id') queryCommunityId?: string
  ) {
    const user = req.user;
    const targetUserId = user.userMongoId || user._id; 
    const adminRecords = await this.communityAdminModel.find({ 
        user: new Types.ObjectId(targetUserId) 
    }).exec();
    let managedCommunityIds: string[] = adminRecords.map(r => r.community.toString());
    if (managedCommunityIds.length === 0) {
      return [];
    }

    let targetIds: string[] = [];
    if (queryCommunityId) {
      if (!managedCommunityIds.includes(queryCommunityId)) {
        throw new ForbiddenException('You do not have permission for this community');
      }
      targetIds = [queryCommunityId];
    } else {
      targetIds = managedCommunityIds;
    }

    return this.eventsService.findAllByCommunities(targetIds);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req, @Param('id') id: string) {
    const user = req.user;
    const event = await this.eventsService.findOne(id);
    const userCommunityId = user.community_id;
    if (event.community_id.toString() !== userCommunityId) {
      throw new ForbiddenException('You are not allowed to view this event');
    }
    return event;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Get(':id/participants')
  // @UseGuards(JwtAuthGuard) // เปิด comment เมื่อต้องการล็อคสิทธิ์
  async getParticipants(@Param('id') id: string) {
    return this.eventsService.getParticipants(id);
  }

  // ไว้ test postman
  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  async joinEvent(@Param('id') id: string, @Req() req) {
    return this.eventsService.joinEvent(id, req.user.userMongoId);
  }
}
