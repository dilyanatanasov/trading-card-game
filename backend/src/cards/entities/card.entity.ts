import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserCard } from './user-card.entity';

export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: CardRarity,
    default: CardRarity.COMMON,
  })
  rarity: CardRarity;

  @Column({ default: 100 })
  baseValue: number;

  @Column({ default: 50 })
  attack: number;

  @Column({ default: 50 })
  defense: number;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'jsonb', nullable: true })
  ability: any; // Stores CardAbility interface

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserCard, (userCard) => userCard.card)
  userCards: UserCard[];
}
