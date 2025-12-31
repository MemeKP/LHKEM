import {
    IsString,
    IsArray,
    IsOptional,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from './location.dto';
import { ContactInfoDto } from './contact-info.dto';
import { CulturalHighlightDto } from './cultural-highlight.dto';
import { HeroSectionDto } from './hero-section.dto';

export class CreateCommunityDto {

    @IsString()
    name: string;

    @IsString()
    history: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => HeroSectionDto)
    hero_section?: HeroSectionDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CulturalHighlightDto)
    cultural_highlights?: CulturalHighlightDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    videos?: string[];

    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @ValidateNested()
    @Type(() => ContactInfoDto)
    contact_info: ContactInfoDto;
}
