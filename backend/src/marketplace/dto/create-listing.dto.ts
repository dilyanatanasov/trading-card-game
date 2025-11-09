import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateListingDto {
  @ApiProperty({ example: 'card-uuid' })
  @IsUUID()
  cardId: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(1)
  price: number;
}
