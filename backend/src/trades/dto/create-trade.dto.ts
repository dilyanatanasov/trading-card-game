import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateTradeDto {
  @ApiProperty({ example: 'uuid-of-receiver' })
  @IsUUID()
  receiverId: string;

  @ApiProperty({ example: ['card-uuid-1', 'card-uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  offeredCardIds: string[];

  @ApiProperty({ example: ['card-uuid-3', 'card-uuid-4'] })
  @IsArray()
  @IsString({ each: true })
  requestedCardIds: string[];

  @ApiProperty({ example: 'Would you like to trade?', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
