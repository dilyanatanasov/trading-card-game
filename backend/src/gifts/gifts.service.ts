import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gift } from './entities/gift.entity';
import { CreateGiftDto } from './dto/create-gift.dto';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class GiftsService {
  constructor(
    @InjectRepository(Gift)
    private giftsRepository: Repository<Gift>,
    private cardsService: CardsService,
  ) {}

  async create(senderId: string, createGiftDto: CreateGiftDto): Promise<Gift> {
    if (senderId === createGiftDto.receiverId) {
      throw new BadRequestException('Cannot gift to yourself');
    }

    // Remove card from sender
    await this.cardsService.removeCardFromUser(senderId, createGiftDto.cardId);

    const gift = this.giftsRepository.create({
      ...createGiftDto,
      senderId,
    });

    return this.giftsRepository.save(gift);
  }

  async findReceived(userId: string): Promise<Gift[]> {
    return this.giftsRepository.find({
      where: { receiverId: userId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSent(userId: string): Promise<Gift[]> {
    return this.giftsRepository.find({
      where: { senderId: userId },
      relations: ['receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  async claim(id: string, userId: string): Promise<Gift> {
    const gift = await this.giftsRepository.findOne({ where: { id } });

    if (!gift) {
      throw new NotFoundException('Gift not found');
    }

    if (gift.receiverId !== userId) {
      throw new BadRequestException('This gift is not for you');
    }

    if (gift.claimed) {
      throw new BadRequestException('Gift already claimed');
    }

    // Add card to receiver
    await this.cardsService.addCardToUser(userId, gift.cardId);

    gift.claimed = true;
    gift.claimedAt = new Date();

    return this.giftsRepository.save(gift);
  }
}
