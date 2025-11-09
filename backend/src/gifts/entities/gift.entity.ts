import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('gifts')
export class Gift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.giftsSent)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.giftsReceived)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  receiverId: string;

  @Column()
  cardId: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ default: false })
  claimed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  claimedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
