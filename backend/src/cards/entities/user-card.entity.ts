import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Card } from './card.entity';

@Entity('user_cards')
export class UserCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Card, (card) => card.userCards)
  @JoinColumn({ name: 'cardId' })
  card: Card;

  @Column()
  cardId: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ default: false })
  isFavorite: boolean;

  @CreateDateColumn()
  acquiredAt: Date;
}
