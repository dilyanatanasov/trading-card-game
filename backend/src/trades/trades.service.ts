import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trade, TradeStatus } from './entities/trade.entity';
import { CreateTradeDto } from './dto/create-trade.dto';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private tradesRepository: Repository<Trade>,
    private cardsService: CardsService,
  ) {}

  async create(initiatorId: string, createTradeDto: CreateTradeDto): Promise<Trade> {
    if (initiatorId === createTradeDto.receiverId) {
      throw new BadRequestException('Cannot trade with yourself');
    }

    const trade = this.tradesRepository.create({
      ...createTradeDto,
      initiatorId,
    });

    return this.tradesRepository.save(trade);
  }

  async findAll(userId: string): Promise<Trade[]> {
    return this.tradesRepository.find({
      where: [{ initiatorId: userId }, { receiverId: userId }],
      relations: ['initiator', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Trade> {
    const trade = await this.tradesRepository.findOne({
      where: { id },
      relations: ['initiator', 'receiver'],
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    return trade;
  }

  async accept(id: string, userId: string): Promise<Trade> {
    const trade = await this.findOne(id);

    if (trade.receiverId !== userId) {
      throw new BadRequestException('Only the receiver can accept this trade');
    }

    if (trade.status !== TradeStatus.PENDING) {
      throw new BadRequestException('Trade is not pending');
    }

    // Transfer cards
    for (const cardId of trade.offeredCardIds) {
      await this.cardsService.transferCard(trade.initiatorId, trade.receiverId, cardId);
    }

    for (const cardId of trade.requestedCardIds) {
      await this.cardsService.transferCard(trade.receiverId, trade.initiatorId, cardId);
    }

    trade.status = TradeStatus.ACCEPTED;
    return this.tradesRepository.save(trade);
  }

  async reject(id: string, userId: string): Promise<Trade> {
    const trade = await this.findOne(id);

    if (trade.receiverId !== userId) {
      throw new BadRequestException('Only the receiver can reject this trade');
    }

    if (trade.status !== TradeStatus.PENDING) {
      throw new BadRequestException('Trade is not pending');
    }

    trade.status = TradeStatus.REJECTED;
    return this.tradesRepository.save(trade);
  }

  async cancel(id: string, userId: string): Promise<Trade> {
    const trade = await this.findOne(id);

    if (trade.initiatorId !== userId) {
      throw new BadRequestException('Only the initiator can cancel this trade');
    }

    if (trade.status !== TradeStatus.PENDING) {
      throw new BadRequestException('Trade is not pending');
    }

    trade.status = TradeStatus.CANCELLED;
    return this.tradesRepository.save(trade);
  }
}
