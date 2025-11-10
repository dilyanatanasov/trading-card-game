import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, IsUrl } from 'class-validator';
import { CardRarity } from '../entities/card.entity';

export class CreateCardDto {
  @ApiProperty({ example: 'Dragon Warrior' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A powerful dragon warrior from the mountains' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'https://example.com/card-image.jpg' })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({ enum: CardRarity, example: CardRarity.RARE })
  @IsEnum(CardRarity)
  rarity: CardRarity;

  @ApiProperty({ example: 500 })
  @IsNumber()
  baseValue: number;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  attack: number;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  defense: number;

  @ApiProperty({ example: 'Fantasy', required: false })
  @IsOptional()
  @IsString()
  category?: string;
}
