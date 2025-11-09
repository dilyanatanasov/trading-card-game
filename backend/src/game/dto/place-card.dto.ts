import { IsUUID, IsInt, Min, Max, IsEnum, IsOptional } from 'class-validator';
import { CardMode } from '../entities/game-card.entity';

export class PlaceCardDto {
  @IsUUID()
  cardId: string;

  @IsInt()
  @Min(0)
  @Max(7)
  position: number; // 0-7 for the 8 positions on the board

  @IsOptional()
  @IsEnum(CardMode)
  mode?: CardMode; // Optional: ATTACK or DEFENSE (defaults to ATTACK)
}
