import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Card } from '../../cards/entities/card.entity';

export enum CardMode {
  ATTACK = 'attack',
  DEFENSE = 'defense',
}

@Entity('game_cards')
export class GameCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameId: string;

  @ManyToOne(() => Game, (game) => game.board)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column()
  cardId: string;

  @ManyToOne(() => Card)
  @JoinColumn({ name: 'cardId' })
  card: Card;

  @Column()
  playerId: string;

  @Column({ type: 'int' })
  position: number; // 0-7 for 8 positions

  @Column({ type: 'int' })
  row: number; // 0 for player 1, 1 for player 2

  @Column({
    type: 'enum',
    enum: CardMode,
    default: CardMode.ATTACK,
  })
  mode: CardMode;

  @Column({ default: false })
  hasActedThisTurn: boolean;
}
