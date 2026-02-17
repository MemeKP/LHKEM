import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
interface JwtPayload {
  userId: string;
  role: string; 
  email: string;
  community_id: string;
}

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

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
  async findAll(@Req() req: Request & { user: JwtPayload }) {
    const user = req.user;
    const targetCommunityId = user.community_id || '6952c7d7a6db8eb05e1908ed';
    return this.eventsService.findAllByCommunity(targetCommunityId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
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
