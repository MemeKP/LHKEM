import { IsBoolean, IsOptional } from 'class-validator';

export class AdminPermissionsDto {
  @IsOptional()
  @IsBoolean()
  can_approve_workshop?: boolean;

  @IsOptional()
  @IsBoolean()
  require_workshop_approval?: boolean;
}
