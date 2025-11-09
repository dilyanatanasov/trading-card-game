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
import { GiftsService } from './gifts.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('gifts')
@Controller('gifts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a gift' })
  create(@Request() req, @Body() createGiftDto: CreateGiftDto) {
    return this.giftsService.create(req.user.userId, createGiftDto);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get received gifts' })
  findReceived(@Request() req) {
    return this.giftsService.findReceived(req.user.userId);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get sent gifts' })
  findSent(@Request() req) {
    return this.giftsService.findSent(req.user.userId);
  }

  @Patch(':id/claim')
  @ApiOperation({ summary: 'Claim a gift' })
  claim(@Request() req, @Param('id') id: string) {
    return this.giftsService.claim(id, req.user.userId);
  }
}
