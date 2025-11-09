import { IsUUID, IsOptional } from 'class-validator';

export class CreateGameDto {
  @IsOptional()
  @IsUUID()
  player2Id?: string; // Optional - can join an existing game or create new one
}
