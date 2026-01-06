import { IsString, IsOptional } from 'class-validator';

export class CulturalHighlightDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  title_en?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  desc_en?: string;
}
