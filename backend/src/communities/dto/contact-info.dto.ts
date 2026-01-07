import { IsOptional, IsString, IsEmail, ValidateNested } from 'class-validator';
import { SocialLinkDto } from './social-link.dto';
import { Type } from 'class-transformer';

export class ContactInfoDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinkDto)
  facebook?: SocialLinkDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinkDto)
  line?: SocialLinkDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinkDto)
  ig?: SocialLinkDto;

  @IsOptional()
  @IsString()
  website?: string;
}
