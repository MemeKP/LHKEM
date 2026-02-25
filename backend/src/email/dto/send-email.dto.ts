import { IsArray, IsEnum, IsNotEmpty, IsObject, IsString, ArrayNotEmpty } from 'class-validator';
import { EmailType } from '../email.interface';

export class SendEmailDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true }) 
  recipients: string[];

  @IsEnum(EmailType) 
  type: EmailType;

  @IsObject()
  @IsNotEmpty()
  payload: any; 
}