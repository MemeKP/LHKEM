import {
    IsString,
    IsArray,
    IsOptional,
    ValidateNested
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LocationDto } from './location.dto';
import { ContactInfoDto } from './contact-info.dto';
import { CulturalHighlightDto } from './cultural-highlight.dto';
import { HeroSectionDto } from './hero-section.dto';

export class CreateCommunityDto {

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    name_en?: string;

    @IsOptional()
    @IsString()
    title_en?: string;

    @IsString()
    history: string;

    @IsOptional()
    @IsString()
    history_en?: string;

    // @IsOptional()
    // @ValidateNested()
    // @Type(() => HeroSectionDto)
    // hero_section?: HeroSectionDto;
    @Transform(({ value }) =>
        typeof value === 'string' ? JSON.parse(value) : value
    )
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

    // @IsOptional()
    // admins?: string[];

    @Transform(({ value }) =>
        typeof value === 'string' ? JSON.parse(value) : value
    )
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;


    @ValidateNested()
    @Transform(({ value }) => {
        if (typeof value === 'string') return JSON.parse(value);
        return value;
    })
    @Type(() => ContactInfoDto)
    contact_info: ContactInfoDto;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') return JSON.parse(value);
        return value;
    })
    admins?: string[];
}
