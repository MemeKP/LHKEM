import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunityAdminDto } from './create-community-admin.dto';

export class UpdateCommunityAdminDto extends PartialType(CreateCommunityAdminDto) {}
