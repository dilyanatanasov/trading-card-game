import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserCard } from '../../cards/entities/user-card.entity';
import { Trade } from '../../trades/entities/trade.entity';
import { Gift } from '../../gifts/entities/gift.entity';
import { MarketplaceListing } from '../../marketplace/entities/marketplace-listing.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: 1000 })
  coins: number;

  @Column({ type: 'timestamp', nullable: true })
  lastDailyCardAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserCard, (userCard) => userCard.user)
  cards: UserCard[];

  @OneToMany(() => Trade, (trade) => trade.initiator)
  tradesInitiated: Trade[];

  @OneToMany(() => Trade, (trade) => trade.receiver)
  tradesReceived: Trade[];

  @OneToMany(() => Gift, (gift) => gift.sender)
  giftsSent: Gift[];

  @OneToMany(() => Gift, (gift) => gift.receiver)
  giftsReceived: Gift[];

  @OneToMany(() => MarketplaceListing, (listing) => listing.seller)
  listings: MarketplaceListing[];
}
