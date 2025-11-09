import { IsUUID, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { CardMode } from '../entities/game-card.entity';

export enum GameActionType {
  SWITCH_MODE = 'switch_mode',
  ATTACK = 'attack',
}

export class GameActionDto {
  @IsUUID()
  gameCardId: string; // The card performing the action

  @IsEnum(GameActionType)
  action: GameActionType;

  @IsOptional()
  @IsEnum(CardMode)
  newMode?: CardMode; // For switch mode action

  @IsOptional()
  @IsUUID()
  targetCardId?: string; // For attack action
}
