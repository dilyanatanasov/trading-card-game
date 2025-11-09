import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardRarity } from './entities/card.entity';
import { UserCard } from './entities/user-card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(UserCard)
    private userCardsRepository: Repository<UserCard>,
    private usersService: UsersService,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const card = this.cardsRepository.create(createCardDto);
    return this.cardsRepository.save(card);
  }

  async findAll(): Promise<Card[]> {
    return this.cardsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return card;
  }

  async getUserCollection(userId: string): Promise<UserCard[]> {
    return this.userCardsRepository.find({
      where: { userId },
      relations: ['card'],
      order: { acquiredAt: 'DESC' },
    });
  }

  async addCardToUser(userId: string, cardId: string): Promise<UserCard> {
    const user = await this.usersService.findOne(userId);
    const card = await this.findOne(cardId);

    // Check if user already has this card
    const existingUserCard = await this.userCardsRepository.findOne({
      where: { userId, cardId },
    });

    if (existingUserCard) {
      existingUserCard.quantity += 1;
      return this.userCardsRepository.save(existingUserCard);
    }

    const userCard = this.userCardsRepository.create({
      userId,
      cardId,
      quantity: 1,
    });

    return this.userCardsRepository.save(userCard);
  }

  async removeCardFromUser(userId: string, cardId: string): Promise<void> {
    const userCard = await this.userCardsRepository.findOne({
      where: { userId, cardId },
    });

    if (!userCard) {
      throw new NotFoundException('User does not have this card');
    }

    if (userCard.quantity > 1) {
      userCard.quantity -= 1;
      await this.userCardsRepository.save(userCard);
    } else {
      await this.userCardsRepository.remove(userCard);
    }
  }

  async transferCard(fromUserId: string, toUserId: string, cardId: string): Promise<void> {
    await this.removeCardFromUser(fromUserId, cardId);
    await this.addCardToUser(toUserId, cardId);
  }

  async getRandomCard(): Promise<Card> {
    const cards = await this.cardsRepository.find();
    if (cards.length === 0) {
      throw new BadRequestException('No cards available');
    }

    // Weighted random based on rarity
    const rarityWeights = {
      [CardRarity.COMMON]: 50,
      [CardRarity.UNCOMMON]: 30,
      [CardRarity.RARE]: 15,
      [CardRarity.EPIC]: 4,
      [CardRarity.LEGENDARY]: 1,
    };

    const weightedCards = cards.flatMap((card) =>
      Array(rarityWeights[card.rarity] || 1).fill(card),
    );

    const randomIndex = Math.floor(Math.random() * weightedCards.length);
    return weightedCards[randomIndex];
  }

  async toggleFavorite(userId: string, cardId: string): Promise<UserCard> {
    const userCard = await this.userCardsRepository.findOne({
      where: { userId, cardId },
    });

    if (!userCard) {
      throw new NotFoundException('User does not have this card');
    }

    userCard.isFavorite = !userCard.isFavorite;
    return this.userCardsRepository.save(userCard);
  }
}
