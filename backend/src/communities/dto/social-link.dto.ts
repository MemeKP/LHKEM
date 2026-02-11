import { IsOptional, IsString } from "class-validator";

export class SocialLinkDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    link?: string;
}