import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  /* Endpoint for POST /api/workshops */
  @Post()
  create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return this.workshopsService.create(createWorkshopDto);
  }

  /* Endpoint for GET /api/workshops */
  @Get()
  findAll() {
    return this.workshopsService.findAll();
  }

  /* Endpoint for GET /api/workshops/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workshopsService.findOne(id);
  }

  /* Endpoint for PATCH /api/workshops/:id/status or general updates */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkshopDto: UpdateWorkshopDto) {
    return this.workshopsService.update(id, updateWorkshopDto);
  }

  /* Endpoint for DELETE /api/workshops/:id */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workshopsService.remove(id);
  }
}