import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly user_id: string;

  @IsString()
  @IsNotEmpty()
  readonly firstname: string;

  @IsString()
  @IsNotEmpty()
  readonly lastname: string;

  @IsString()
  @MinLength(8)
  readonly password: string;

  @IsEmail()
  readonly email: string;

  @IsPhoneNumber('TH') 
  readonly phone: string;
}
