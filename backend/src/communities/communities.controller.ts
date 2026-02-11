import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Controller('api/communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) { }

  @Post()
  create(@Body() createCommunityDto: CreateCommunityDto) {
    return this.communitiesService.create(createCommunityDto);
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
  getMedia(@Param('id') id:string){
    return this.communitiesService.getMedia(id);
  }

  @Get(':id/map')
  getMapData(@Param('id') id:string){
    return this.communitiesService.getMapData(id);
  }

  @Get(':id/workshops')
  getWorkshopsPreview(@Param('id') id:string, @Query('limit', new ParseIntPipe({optional:true})) limit: number = 3,){
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

}