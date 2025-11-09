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
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('trades')
@Controller('trades')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trade offer' })
  create(@Request() req, @Body() createTradeDto: CreateTradeDto) {
    return this.tradesService.create(req.user.userId, createTradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trades for current user' })
  findAll(@Request() req) {
    return this.tradesService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trade by ID' })
  findOne(@Param('id') id: string) {
    return this.tradesService.findOne(id);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept trade offer' })
  accept(@Request() req, @Param('id') id: string) {
    return this.tradesService.accept(id, req.user.userId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject trade offer' })
  reject(@Request() req, @Param('id') id: string) {
    return this.tradesService.reject(id, req.user.userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel trade offer' })
  cancel(@Request() req, @Param('id') id: string) {
    return this.tradesService.cancel(id, req.user.userId);
  }
}
