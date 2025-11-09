import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceListing } from './entities/marketplace-listing.entity';
import { CardsModule } from '../cards/cards.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([MarketplaceListing]), CardsModule, UsersModule],
  providers: [MarketplaceService],
  controllers: [MarketplaceController],
})
export class MarketplaceModule {}
