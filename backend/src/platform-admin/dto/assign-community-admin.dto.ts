import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignCommunityAdminDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string; 
}