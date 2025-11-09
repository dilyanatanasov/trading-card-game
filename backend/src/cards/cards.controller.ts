import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('cards')
@Controller('cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new card (admin)' })
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cards' })
  findAll() {
    return this.cardsService.findAll();
  }

  @Get('my-collection')
  @ApiOperation({ summary: 'Get current user card collection' })
  getMyCollection(@Request() req) {
    return this.cardsService.getUserCollection(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card by ID' })
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch(':cardId/favorite')
  @ApiOperation({ summary: 'Toggle favorite status of a card' })
  toggleFavorite(@Request() req, @Param('cardId') cardId: string) {
    return this.cardsService.toggleFavorite(req.user.userId, cardId);
  }

  @Post('add-to-collection/:cardId')
  @ApiOperation({ summary: 'Add a card to your collection (for testing)' })
  addToCollection(@Request() req, @Param('cardId') cardId: string) {
    return this.cardsService.addCardToUser(req.user.userId, cardId);
  }

  @Get('daily/claim')
  @ApiOperation({ summary: 'Claim your daily random card' })
  async claimDailyCard(@Request() req) {
    const randomCard = await this.cardsService.getRandomCard();
    await this.cardsService.addCardToUser(req.user.userId, randomCard.id);
    return { message: 'Daily card claimed!', card: randomCard };
  }
}
