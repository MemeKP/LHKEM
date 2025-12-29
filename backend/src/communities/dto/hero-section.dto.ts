import { IsNotEmpty, IsString } from "class-validator";

export class HeroSectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}