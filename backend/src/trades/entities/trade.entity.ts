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

export enum TradeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.tradesInitiated)
  @JoinColumn({ name: 'initiatorId' })
  initiator: User;

  @Column()
  initiatorId: string;

  @ManyToOne(() => User, (user) => user.tradesReceived)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  receiverId: string;

  @Column('simple-array')
  offeredCardIds: string[];

  @Column('simple-array')
  requestedCardIds: string[];

  @Column({
    type: 'enum',
    enum: TradeStatus,
    default: TradeStatus.PENDING,
  })
  status: TradeStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
