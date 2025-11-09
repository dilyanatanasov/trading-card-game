import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { Trade } from './entities/trade.entity';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trade]), CardsModule],
  providers: [TradesService],
  controllers: [TradesController],
})
export class TradesModule {}
