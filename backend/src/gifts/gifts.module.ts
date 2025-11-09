import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftsService } from './gifts.service';
import { GiftsController } from './gifts.controller';
import { Gift } from './entities/gift.entity';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Gift]), CardsModule],
  providers: [GiftsService],
  controllers: [GiftsController],
})
export class GiftsModule {}
