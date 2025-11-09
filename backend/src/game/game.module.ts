import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { Game } from './entities/game.entity';
import { GameCard } from './entities/game-card.entity';
import { GameRecord } from './entities/game-record.entity';
import { UserCard } from '../cards/entities/user-card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, GameCard, GameRecord, UserCard]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
