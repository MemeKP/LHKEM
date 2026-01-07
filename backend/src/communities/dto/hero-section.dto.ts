import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class HeroSectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  title_en?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  description_en?: string;
}