import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('marketplace')
@Controller('marketplace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a marketplace listing' })
  create(@Request() req, @Body() createListingDto: CreateListingDto) {
    return this.marketplaceService.create(req.user.userId, createListingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active marketplace listings' })
  findAll() {
    return this.marketplaceService.findAll();
  }

  @Get('my-listings')
  @ApiOperation({ summary: 'Get current user listings' })
  findMyListings(@Request() req) {
    return this.marketplaceService.findBySeller(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing by ID' })
  findOne(@Param('id') id: string) {
    return this.marketplaceService.findOne(id);
  }

  @Post(':id/buy')
  @ApiOperation({ summary: 'Buy a card from marketplace' })
  buy(@Request() req, @Param('id') id: string) {
    return this.marketplaceService.buy(id, req.user.userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a listing' })
  cancel(@Request() req, @Param('id') id: string) {
    return this.marketplaceService.cancel(id, req.user.userId);
  }
}
