import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GameCard } from './game-card.entity';

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player1Id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'player1Id' })
  player1: User;

  @Column({ nullable: true })
  player2Id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'player2Id' })
  player2: User;

  @Column({ default: 5000 })
  player1Health: number;

  @Column({ default: 5000 })
  player2Health: number;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.WAITING,
  })
  status: GameStatus;

  @Column({ nullable: true })
  currentTurnPlayerId: string;

  @Column({ default: 1 })
  turnNumber: number;

  @Column({ nullable: true })
  winnerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'winnerId' })
  winner: User;

  @OneToMany(() => GameCard, (gameCard) => gameCard.game)
  board: GameCard[];

  // Deck system: JSON array of card IDs for each player
  @Column({ type: 'jsonb', nullable: true })
  player1Deck: string[];

  @Column({ type: 'jsonb', nullable: true })
  player2Deck: string[];

  // Hand system: JSON array of card IDs currently in each player's hand
  @Column({ type: 'jsonb', default: [] })
  player1Hand: string[];

  @Column({ type: 'jsonb', default: [] })
  player2Hand: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
