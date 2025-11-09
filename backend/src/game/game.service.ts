import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GameStatus } from './entities/game.entity';
import { GameCard, CardMode } from './entities/game-card.entity';
import { GameRecord } from './entities/game-record.entity';
import { UserCard } from '../cards/entities/user-card.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { PlaceCardDto } from './dto/place-card.dto';
import { GameActionDto, GameActionType } from './dto/game-action.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(GameCard)
    private gameCardRepository: Repository<GameCard>,
    @InjectRepository(GameRecord)
    private gameRecordRepository: Repository<GameRecord>,
    @InjectRepository(UserCard)
    private userCardRepository: Repository<UserCard>,
  ) {}

  async createGame(userId: string, createGameDto: CreateGameDto): Promise<Game> {
    const game = this.gameRepository.create({
      player1Id: userId,
      player2Id: createGameDto.player2Id,
      currentTurnPlayerId: userId,
      status: createGameDto.player2Id ? GameStatus.IN_PROGRESS : GameStatus.WAITING,
    });

    return this.gameRepository.save(game);
  }

  async joinGame(gameId: string, userId: string): Promise<Game> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Game is not waiting for players');
    }

    if (game.player1Id === userId) {
      throw new BadRequestException('You are already in this game');
    }

    game.player2Id = userId;
    game.status = GameStatus.IN_PROGRESS;
    game.currentTurnPlayerId = game.player1Id;

    return this.gameRepository.save(game);
  }

  async getGame(gameId: string): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['player1', 'player2', 'board', 'board.card'],
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async placeCard(
    gameId: string,
    userId: string,
    placeCardDto: PlaceCardDto,
  ): Promise<Game> {
    const game = await this.getGame(gameId);

    // Validate it's the player's turn
    if (game.currentTurnPlayerId !== userId) {
      throw new ForbiddenException('Not your turn');
    }

    // Check if position is already occupied
    const row = userId === game.player1Id ? 0 : 1;
    const existingCard = await this.gameCardRepository.findOne({
      where: {
        gameId,
        position: placeCardDto.position,
        row,
      },
    });

    if (existingCard) {
      throw new BadRequestException('Position already occupied');
    }

    // Verify user owns the card
    const userCard = await this.userCardRepository.findOne({
      where: {
        userId,
        cardId: placeCardDto.cardId,
      },
    });

    if (!userCard || userCard.quantity < 1) {
      throw new BadRequestException('You do not own this card');
    }

    // Place the card
    const gameCard = this.gameCardRepository.create({
      gameId,
      cardId: placeCardDto.cardId,
      playerId: userId,
      position: placeCardDto.position,
      row,
      mode: CardMode.ATTACK,
      hasActedThisTurn: true, // Card just placed, cannot act immediately
    });

    await this.gameCardRepository.save(gameCard);

    // End turn after placing a card
    await this.endTurn(gameId, userId);

    return this.getGame(gameId);
  }

  async performAction(
    gameId: string,
    userId: string,
    actionDto: GameActionDto,
  ): Promise<Game> {
    const game = await this.getGame(gameId);

    if (game.currentTurnPlayerId !== userId) {
      throw new ForbiddenException('Not your turn');
    }

    const gameCard = await this.gameCardRepository.findOne({
      where: { id: actionDto.gameCardId },
      relations: ['card'],
    });

    if (!gameCard) {
      throw new NotFoundException('Card not found on board');
    }

    if (gameCard.playerId !== userId) {
      throw new ForbiddenException('This is not your card');
    }

    if (gameCard.hasActedThisTurn) {
      throw new BadRequestException('Card has already acted this turn');
    }

    if (actionDto.action === GameActionType.SWITCH_MODE) {
      console.log(`=== SWITCH MODE ===`);
      console.log(`Card: ${gameCard.card.name}, Current mode: ${gameCard.mode}, New mode: ${actionDto.newMode}`);
      gameCard.mode = actionDto.newMode;
      gameCard.hasActedThisTurn = true;
      await this.gameCardRepository.save(gameCard);
      console.log(`Mode switched successfully!`);
    } else if (actionDto.action === GameActionType.ATTACK) {
      await this.performAttack(game, gameCard, actionDto.targetCardId);
    }

    // Check if game is over
    await this.checkGameOver(game);

    // End turn after performing an action
    await this.endTurn(gameId, userId);

    return this.getGame(gameId);
  }

  private async performAttack(
    game: Game,
    attackingCard: GameCard & { card: any },
    targetCardId?: string,
  ): Promise<void> {
    const attackPower = attackingCard.card.attack;
    console.log(`=== ATTACK STARTED ===`);
    console.log(`Attacker: ${attackingCard.card.name} (${attackPower} ATK)`);
    console.log(`Target Card ID: ${targetCardId || 'Direct attack on player'}`);
    console.log(`Game: Player1 HP=${game.player1Health}, Player2 HP=${game.player2Health}`);

    if (targetCardId) {
      // Attack enemy card
      const targetCard = await this.gameCardRepository.findOne({
        where: { id: targetCardId },
        relations: ['card'],
      });

      if (!targetCard) {
        throw new NotFoundException('Target card not found');
      }

      if (targetCard.playerId === attackingCard.playerId) {
        throw new BadRequestException('Cannot attack your own card');
      }

      console.log(`DEBUG: targetCard =`, JSON.stringify(targetCard, null, 2));
      console.log(`DEBUG: targetCard.card =`, targetCard.card);
      console.log(`DEBUG: targetCard.mode =`, targetCard.mode);

      const targetDefenseValue = targetCard.mode === CardMode.DEFENSE
        ? targetCard.card.defense
        : targetCard.card.attack;

      console.log(`Target: ${targetCard.card.name} (Mode: ${targetCard.mode}, Defense Value: ${targetDefenseValue})`);

      // Determine outcome
      if (attackPower > targetDefenseValue) {
        // Attacker wins - destroy target card
        await this.gameCardRepository.remove(targetCard);
        console.log(`Target card destroyed!`);

        // Only deal remaining damage if target was in ATTACK mode
        if (targetCard.mode === CardMode.ATTACK) {
          const remainingDamage = attackPower - targetDefenseValue;
          if (attackingCard.playerId === game.player1Id) {
            game.player2Health -= remainingDamage;
            console.log(`Player 2 health reduced by ${remainingDamage}. New health: ${game.player2Health}`);
          } else {
            game.player1Health -= remainingDamage;
            console.log(`Player 1 health reduced by ${remainingDamage}. New health: ${game.player1Health}`);
          }
          await this.gameRepository.save(game);
        } else {
          console.log(`Target was in defense mode - no HP damage dealt`);
        }
      } else if (attackPower === targetDefenseValue) {
        // Equal power - both cards are destroyed
        console.log(`Equal power - both cards destroyed`);
        await this.gameCardRepository.remove(targetCard);
        await this.gameCardRepository.remove(attackingCard);
        // Don't mark as acted since the card is destroyed
        return;
      } else {
        // Attacker loses - destroy attacking card
        console.log(`Attacker lost! Destroying attacking card`);
        await this.gameCardRepository.remove(attackingCard);
        // Don't mark as acted since the card is destroyed
        return;
      }
    } else {
      // Direct attack on player
      const opponentRow = attackingCard.row === 0 ? 1 : 0;
      const blockingCards = await this.gameCardRepository.count({
        where: { gameId: game.id, row: opponentRow },
      });

      if (blockingCards > 0) {
        throw new BadRequestException('Cannot attack player directly while they have cards');
      }

      // Deal damage to opponent
      if (attackingCard.playerId === game.player1Id) {
        game.player2Health -= attackPower;
        console.log(`Direct attack! Player 2 health reduced by ${attackPower}. New health: ${game.player2Health}`);
      } else {
        game.player1Health -= attackPower;
        console.log(`Direct attack! Player 1 health reduced by ${attackPower}. New health: ${game.player1Health}`);
      }

      await this.gameRepository.save(game);
    }

    attackingCard.hasActedThisTurn = true;
    await this.gameCardRepository.save(attackingCard);
  }

  async forfeitGame(gameId: string, userId: string): Promise<Game> {
    const game = await this.getGame(gameId);

    if (game.status === GameStatus.FINISHED) {
      throw new BadRequestException('Game is already finished');
    }

    if (game.player1Id !== userId && game.player2Id !== userId) {
      throw new ForbiddenException('You are not part of this game');
    }

    // If game is still waiting (no opponent), just cancel it
    if (game.status === GameStatus.WAITING) {
      game.status = GameStatus.FINISHED;
      await this.gameRepository.save(game);
      console.log(`Game ${gameId} cancelled by ${userId} (no opponent)`);
      return this.getGame(gameId);
    }

    // Game is in progress, determine winner (the other player)
    const winnerId = game.player1Id === userId ? game.player2Id : game.player1Id;

    game.status = GameStatus.FINISHED;
    game.winnerId = winnerId;
    await this.gameRepository.save(game);

    // Update game records
    await this.updateGameRecords(winnerId, game.player1Id, game.player2Id);

    console.log(`Game ${gameId} forfeited by ${userId}. Winner: ${winnerId}`);

    return this.getGame(gameId);
  }

  async endTurn(gameId: string, userId: string): Promise<Game> {
    const game = await this.getGame(gameId);

    if (game.currentTurnPlayerId !== userId) {
      throw new ForbiddenException('Not your turn');
    }

    // Switch turn
    game.currentTurnPlayerId =
      game.currentTurnPlayerId === game.player1Id ? game.player2Id : game.player1Id;

    // Reset all cards for the new turn
    const playerCards = await this.gameCardRepository.find({
      where: { gameId, playerId: game.currentTurnPlayerId },
    });

    for (const card of playerCards) {
      card.hasActedThisTurn = false;
      await this.gameCardRepository.save(card);
    }

    await this.gameRepository.save(game);

    return this.getGame(gameId);
  }

  private async checkGameOver(game: Game): Promise<void> {
    if (game.player1Health <= 0 || game.player2Health <= 0) {
      game.status = GameStatus.FINISHED;
      game.winnerId = game.player1Health > 0 ? game.player1Id : game.player2Id;
      await this.gameRepository.save(game);

      // Update records
      await this.updateGameRecords(game.winnerId, game.player1Id, game.player2Id);
    }
  }

  private async updateGameRecords(
    winnerId: string,
    player1Id: string,
    player2Id: string,
  ): Promise<void> {
    const loserId = winnerId === player1Id ? player2Id : player1Id;

    // Update winner record
    let winnerRecord = await this.gameRecordRepository.findOne({
      where: { userId: winnerId },
    });

    if (!winnerRecord) {
      winnerRecord = this.gameRecordRepository.create({ userId: winnerId });
    }

    winnerRecord.wins += 1;
    winnerRecord.totalGames += 1;
    await this.gameRecordRepository.save(winnerRecord);

    // Update loser record
    let loserRecord = await this.gameRecordRepository.findOne({
      where: { userId: loserId },
    });

    if (!loserRecord) {
      loserRecord = this.gameRecordRepository.create({ userId: loserId });
    }

    loserRecord.losses += 1;
    loserRecord.totalGames += 1;
    await this.gameRecordRepository.save(loserRecord);
  }

  async getPlayerRecord(userId: string): Promise<GameRecord> {
    let record = await this.gameRecordRepository.findOne({
      where: { userId },
    });

    if (!record) {
      record = this.gameRecordRepository.create({ userId });
      await this.gameRecordRepository.save(record);
    }

    return record;
  }

  async getAvailableGames(): Promise<Game[]> {
    return this.gameRepository.find({
      where: { status: GameStatus.WAITING },
      relations: ['player1'],
    });
  }

  async getMyGames(userId: string): Promise<Game[]> {
    // Only return waiting and in-progress games, exclude finished games
    return this.gameRepository.find({
      where: [
        { player1Id: userId, status: GameStatus.WAITING },
        { player1Id: userId, status: GameStatus.IN_PROGRESS },
        { player2Id: userId, status: GameStatus.IN_PROGRESS },
      ],
      relations: ['player1', 'player2', 'board', 'board.card'],
      order: { updatedAt: 'DESC' },
    });
  }
}
