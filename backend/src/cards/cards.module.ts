import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card } from './entities/card.entity';
import { UserCard } from './entities/user-card.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card, UserCard]), UsersModule],
  providers: [CardsService],
  controllers: [CardsController],
  exports: [CardsService],
})
export class CardsModule {}
