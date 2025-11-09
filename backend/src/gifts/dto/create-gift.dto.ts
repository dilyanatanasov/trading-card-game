import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateGiftDto {
  @ApiProperty({ example: 'uuid-of-receiver' })
  @IsUUID()
  receiverId: string;

  @ApiProperty({ example: 'card-uuid' })
  @IsUUID()
  cardId: string;

  @ApiProperty({ example: 'Happy birthday!', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
