import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { WorkshopregistrationsService } from './workshopregistrations.service';
import { CreateWorkshopregistrationDto } from './dto/create-workshopregistration.dto';
import { UpdateWorkshopregistrationDto } from './dto/update-workshopregistration.dto';

@Controller('enroll')
export class WorkshopregistrationsController {
  constructor(private readonly workshopregistrationsService: WorkshopregistrationsService) {}

  @Post()
  create(@Body() createWorkshopregistrationDto: CreateWorkshopregistrationDto) {
    return this.workshopregistrationsService.create(createWorkshopregistrationDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.workshopregistrationsService.findByUserId(userId);
    }
    return this.workshopregistrationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    /* The '+' converts the string ID to a number to match your service signature */
    return this.workshopregistrationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkshopregistrationDto: UpdateWorkshopregistrationDto) {
    return this.workshopregistrationsService.update(id, updateWorkshopregistrationDto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.workshopregistrationsService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workshopregistrationsService.remove(id);
  }
}