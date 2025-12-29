import { IsString, IsOptional } from 'class-validator';

export class CulturalHighlightDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  desc?: string;
}
