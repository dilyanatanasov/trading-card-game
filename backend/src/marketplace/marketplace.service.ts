import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceListing, ListingStatus } from './entities/marketplace-listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { CardsService } from '../cards/cards.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(MarketplaceListing)
    private listingsRepository: Repository<MarketplaceListing>,
    private cardsService: CardsService,
    private usersService: UsersService,
  ) {}

  async create(sellerId: string, createListingDto: CreateListingDto): Promise<MarketplaceListing> {
    // Verify seller has the card
    const userCards = await this.cardsService.getUserCollection(sellerId);
    const hasCard = userCards.some((uc) => uc.cardId === createListingDto.cardId);

    if (!hasCard) {
      throw new BadRequestException('You do not own this card');
    }

    const listing = this.listingsRepository.create({
      ...createListingDto,
      sellerId,
    });

    return this.listingsRepository.save(listing);
  }

  async findAll(): Promise<MarketplaceListing[]> {
    return this.listingsRepository.find({
      where: { status: ListingStatus.ACTIVE },
      relations: ['seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MarketplaceListing> {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async buy(id: string, buyerId: string): Promise<MarketplaceListing> {
    const listing = await this.findOne(id);

    if (listing.sellerId === buyerId) {
      throw new BadRequestException('Cannot buy your own listing');
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException('Listing is not active');
    }

    const buyer = await this.usersService.findOne(buyerId);

    if (buyer.coins < listing.price) {
      throw new BadRequestException('Insufficient coins');
    }

    // Transfer coins
    await this.usersService.updateCoins(buyerId, -listing.price);
    await this.usersService.updateCoins(listing.sellerId, listing.price);

    // Transfer card
    await this.cardsService.transferCard(listing.sellerId, buyerId, listing.cardId);

    // Update listing
    listing.status = ListingStatus.SOLD;
    listing.buyerId = buyerId;
    listing.soldAt = new Date();

    return this.listingsRepository.save(listing);
  }

  async cancel(id: string, userId: string): Promise<MarketplaceListing> {
    const listing = await this.findOne(id);

    if (listing.sellerId !== userId) {
      throw new BadRequestException('You can only cancel your own listings');
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException('Listing is not active');
    }

    listing.status = ListingStatus.CANCELLED;
    return this.listingsRepository.save(listing);
  }

  async findBySeller(sellerId: string): Promise<MarketplaceListing[]> {
    return this.listingsRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }
}
