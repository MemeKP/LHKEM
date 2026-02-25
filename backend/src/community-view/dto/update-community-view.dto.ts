import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunityViewDto } from './create-community-view.dto';

export class UpdateCommunityViewDto extends PartialType(CreateCommunityViewDto) {}
