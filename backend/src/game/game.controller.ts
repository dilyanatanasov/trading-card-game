import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGameDto } from './dto/create-game.dto';
import { PlaceCardDto } from './dto/place-card.dto';
import { GameActionDto } from './dto/game-action.dto';

@Controller('game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  createGame(@Request() req, @Body() createGameDto: CreateGameDto) {
    return this.gameService.createGame(req.user.userId, createGameDto);
  }

  @Get('available')
  getAvailableGames(@Request() req) {
    return this.gameService.getAvailableGames(req.user.userId);
  }

  @Get('my-games')
  getMyGames(@Request() req) {
    return this.gameService.getMyGames(req.user.userId);
  }

  @Get('records/me')
  getMyRecord(@Request() req) {
    return this.gameService.getPlayerRecord(req.user.userId);
  }

  @Get('records/:userId')
  getPlayerRecord(@Param('userId') userId: string) {
    return this.gameService.getPlayerRecord(userId);
  }

  @Get(':id')
  getGame(@Param('id') id: string) {
    return this.gameService.getGame(id);
  }

  @Post(':id/join')
  joinGame(@Param('id') id: string, @Request() req) {
    return this.gameService.joinGame(id, req.user.userId);
  }

  @Post(':id/place-card')
  placeCard(
    @Param('id') id: string,
    @Request() req,
    @Body() placeCardDto: PlaceCardDto,
  ) {
    return this.gameService.placeCard(id, req.user.userId, placeCardDto);
  }

  @Post(':id/action')
  performAction(
    @Param('id') id: string,
    @Request() req,
    @Body() actionDto: GameActionDto,
  ) {
    return this.gameService.performAction(id, req.user.userId, actionDto);
  }

  @Post(':id/end-turn')
  endTurn(@Param('id') id: string, @Request() req) {
    return this.gameService.endTurn(id, req.user.userId);
  }

  @Post(':id/forfeit')
  forfeitGame(@Param('id') id: string, @Request() req) {
    return this.gameService.forfeitGame(id, req.user.userId);
  }
}
