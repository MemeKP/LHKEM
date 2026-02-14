import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformAdminDto } from './create-platform-admin.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum CommunityStatus {
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
  PENDING  = 'pending',
}

export class UpdatePlatformAdminDto extends PartialType(CreatePlatformAdminDto) {
     @IsEnum(CommunityStatus)
        status: CommunityStatus;
    
        @IsOptional() @IsString()
        reason?: string;
}
