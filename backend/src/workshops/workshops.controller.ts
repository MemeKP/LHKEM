import { Controller, Get, Patch, Param } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';

// Route: /workshops
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Get()
  findAllActive() {
    return this.workshopsService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workshopsService.findOne(id);
  }

  @Patch(':id/view')
  async incrementView(@Param('id') id: string) {
    // We call the service here, NOT the workshopModel directly
    return this.workshopsService.incrementView(id);
  }
}