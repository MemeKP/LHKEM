import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, BadRequestException, ForbiddenException, Query, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { CommunityAdmin } from 'src/community-admin/schemas/community-admin.schema';
import { Model, Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
interface JwtPayload {
  userId: string;
  role: string;
  email: string;
  community_id: string;
}

const eventImageUploadOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads/events';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `event-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new BadRequestException('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
};

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService,
    @InjectModel(CommunityAdmin.name) private communityAdminModel: Model<CommunityAdmin>
  ) { }

  // @UseGuards(JwtAuthGuard)
  // @Post()
  // create(
  //   @Body() createEventDto: CreateEventDto,
  //   @Req() req: Request & { user: JwtPayload }
  // ) {
  //   const user = req.user;
  //   const targetCommunityId = user.community_id || '6952c7d7a6db8eb05e1908ed';
  //   if (!targetCommunityId) {
  //     throw new BadRequestException('User does not belong to any community');
  //   }
  //   return this.eventsService.create(
  //     createEventDto,
  //     user.userId,
  //     user.role,
  //     targetCommunityId
  //   );
  // }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', eventImageUploadOptions),
  )
  async createEvent(
    @Req() req: any,
    @Body() createEventDto: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userMongoId || req.user._id;

    const adminRecord = await this.communityAdminModel.findOne({
      user: new Types.ObjectId(userId)
    }).exec();

    if (!adminRecord) {
      throw new ForbiddenException('Cannot create Event');
    }

    if (typeof createEventDto.location === 'string') {
      createEventDto.location = JSON.parse(createEventDto.location);
    }

    if (typeof createEventDto.workshops === 'string') {
      createEventDto.workshops = JSON.parse(createEventDto.workshops);
    }

    if (typeof createEventDto.contact === 'string') {
      createEventDto.contact = JSON.parse(createEventDto.contact);
    }
    if (file) {
      createEventDto.images = [
        `/uploads/events/${file.filename}`
      ];
    }

    const communityId = adminRecord.community.toString();

    return this.eventsService.create(
      createEventDto,
      userId,
      'COMMUNITY_ADMIN',
      communityId
    );
  }


  @Get('pending')
  @UseGuards(JwtAuthGuard)
  async findPending(@Req() req: any) {
    const userId = req.user.userMongoId || req.user._id;
    const adminRecord = await this.communityAdminModel.findOne({
      user: new Types.ObjectId(userId)
    }).exec();

    if (!adminRecord) {
      return [];
    }
    const communityId = adminRecord.community.toString();
    return this.eventsService.findPending(communityId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() req: any,
  ) {
    const user = req.user;
    const targetUserId = user.userMongoId || user._id;
    const adminRecord = await this.communityAdminModel.findOne({
      user: new Types.ObjectId(targetUserId)
    }).exec();
    if (!adminRecord) {
      return [];
    }
    const communityId = adminRecord.community.toString();
    return this.eventsService.findAllByCommunities([communityId]);
  }

  @Get('public/:slug')
  async findPublicEvents(@Param('slug') slug: string, @Query('status') status?: string) {
    return this.eventsService.findPublicByCommunity(slug, status);
  }

  @Get('public/:slug/:id')
  async findPublicEventDetail(@Param('slug') slug: string, @Param('id') id: string) {
    return this.eventsService.findPublicEventDetail(slug, id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req, @Param('id') id: string) {
    const user = req.user;
    const targetUserId = user.userMongoId || user._id;

    const event = await this.eventsService.findOne(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const adminRecord = await this.communityAdminModel.findOne({
      user: new Types.ObjectId(targetUserId)
    }).exec();

    if (!adminRecord) {
      throw new ForbiddenException('You are not an admin');
    }

    const userCommunityId = adminRecord.community.toString();
    if (event.community_id.toString() !== userCommunityId) {
      throw new ForbiddenException('You are not allowed to view this event');
    }
    return event;
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', eventImageUploadOptions))
  update(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto, image);
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
