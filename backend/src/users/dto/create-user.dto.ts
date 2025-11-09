import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}
