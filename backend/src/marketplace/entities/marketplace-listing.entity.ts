import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
}

@Entity('marketplace_listings')
export class MarketplaceListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.listings)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  sellerId: string;

  @Column()
  cardId: string;

  @Column()
  price: number;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
  })
  status: ListingStatus;

  @Column({ type: 'uuid', nullable: true })
  buyerId: string;

  @Column({ type: 'timestamp', nullable: true })
  soldAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
