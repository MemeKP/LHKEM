import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EventStatus } from '../events.types';

export class UpdateEventDto extends PartialType(CreateEventDto) {
    @IsOptional()
    @IsEnum(EventStatus)
    status?: EventStatus;
}
