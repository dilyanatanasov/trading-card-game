import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class PlaceCardDto {
  @IsUUID()
  cardId: string;

  @IsInt()
  @Min(0)
  @Max(7)
  position: number; // 0-7 for the 8 positions on the board
}
