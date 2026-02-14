import { IsString, IsNotEmpty, IsOptional, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CoordinatesDto {
    lat: number;
    lng: number;
}

class LocationDto {
    @IsString() @IsNotEmpty() address: string;
    @IsString() @IsNotEmpty() province: string;
    @IsOptional() @IsString() district?: string;
    @IsOptional() @IsString() subDistrict?: string;
    @IsOptional() @IsString() postalCode?: string;
    @ValidateNested() @Type(() => CoordinatesDto) coordinates: CoordinatesDto;
}

class ContactInfoDto {
    @IsOptional() @IsString() phone?: string;
    @IsOptional() @IsString() email?: string;
    @IsOptional() @IsString() facebook?: string;
    @IsOptional() @IsString() line?: string;
    @IsOptional() @IsString() website?: string;
}

export class CreatePlatformAdminDto {
    @IsString() @IsNotEmpty() name: string;
    @IsString() @IsNotEmpty() description: string;
    @IsString() @IsNotEmpty() history: string;
    @IsString() @IsNotEmpty() culturalHighlights: string;

    @ValidateNested() @Type(() => LocationDto)
    location: LocationDto;

    @ValidateNested() @Type(() => ContactInfoDto)
    contactInfo: ContactInfoDto;

    @IsOptional() @IsString({ each: true })
    tags?: string[];

    // ถ้าต้องการแต่งตั้ง community admin ทันทีตอนสร้างชุมชน
    @IsOptional() @IsMongoId()
    initialAdminUserId?: string; // User._id
}


