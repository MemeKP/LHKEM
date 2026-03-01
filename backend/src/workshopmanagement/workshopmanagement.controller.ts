import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { WorkshopManagementService } from './workshopmanagement.service';
import { CreateWorkshopDto } from '../workshops/dto/create-workshop.dto';
import { UpdateWorkshopDto } from '../workshops/dto/update-workshop.dto';

// Import your Auth Guards (Adjust path as needed)
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Route: /management/workshops
@Controller('management/workshops')
@UseGuards(JwtAuthGuard, RolesGuard) // Protects the ENTIRE controller
export class WorkshopManagementController {
  constructor(private readonly managementService: WorkshopManagementService) {}

  @Roles('SHOP_OWNER', 'COMMUNITY_ADMIN', 'PLATFORM_ADMIN')
  @Post()
  create(@Body() createWorkshopDto: CreateWorkshopDto, @Request() req) {
    return this.managementService.create(createWorkshopDto);
  }

  // ==========================================
  // 🚨 STATIC ROUTES MUST GO ABOVE ':id' ROUTES
  // ==========================================

  @Roles('COMMUNITY_ADMIN', 'PLATFORM_ADMIN')
  @Get('pending')
  findPending(@Query('communityId') communityId: string) { // 👈 Added Query param extraction
    return this.managementService.findPending(communityId);
  }

  @Roles('SHOP_OWNER', 'COMMUNITY_ADMIN', 'PLATFORM_ADMIN')
  @Get('shop/:shopId')
  findByShopId(@Param('shopId') shopId: string) {
    return this.managementService.findByShopId(shopId);
  }

  @Roles('SHOP_OWNER', 'COMMUNITY_ADMIN')
  @Patch('enrollments/:registrationId/status')
  async updateEnrollmentStatus(
    @Param('registrationId') registrationId: string,
    @Body('status') status: string
  ) {
    return this.managementService.updateRegistrationStatus(registrationId, status);
  }

  // ==========================================
  // 🔄 DYNAMIC / :ID ROUTES GO BELOW
  // ==========================================

  @Roles('SHOP_OWNER', 'COMMUNITY_ADMIN', 'PLATFORM_ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managementService.findOne(id);
  }

  @Roles('SHOP_OWNER', 'COMMUNITY_ADMIN', 'PLATFORM_ADMIN')
  @Get(':id/enrollments')
  async getWorkshopEnrollments(@Param('id') id: string) {
    const registrations = await this.managementService.findEnrollmentsByWorkshop(id);
    return registrations || [];
  }

  @Roles('COMMUNITY_ADMIN', 'PLATFORM_ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.managementService.updateStatus(id, status);
  }

  // Fixed Duplicate Patch Route
  @Roles('SHOP_OWNER', 'COMMUNITY_ADMIN', 'PLATFORM_ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.managementService.update(id, updateData);
  }

  @Roles('SHOP_OWNER', 'PLATFORM_ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.managementService.remove(id);
  }
}