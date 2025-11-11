import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/game.entity';
import { GameCard } from '../entities/game-card.entity';
import { CardAbilityTrigger, CardAbilityType } from '../../cards/enums/card-ability.enum';

export interface AbilityExecutionResult {
  message: string;
  damageDealt?: number;
  healingDone?: number;
  cardsDestroyed?: string[];
  cardResurrected?: boolean;
}

@Injectable()
export class AbilityExecutorService {
  constructor(
    @InjectRepository(GameCard)
    private gameCardRepository: Repository<GameCard>,
  ) {}

  async executeAbility(
    game: Game,
    gameCard: GameCard & { card: any },
    trigger: CardAbilityTrigger,
  ): Promise<AbilityExecutionResult | null> {
    const ability = gameCard.card.ability;

    if (!ability || ability.trigger !== trigger) {
      return null;
    }

    console.log(`\n🔥 ABILITY TRIGGERED: ${ability.name}`);
    console.log(`   Card: ${gameCard.card.name}`);
    console.log(`   Trigger: ${trigger}`);
    console.log(`   Description: ${ability.description}\n`);

    switch (ability.type) {
      case CardAbilityType.AREA_DAMAGE:
        return await this.executeAreaDamage(game, gameCard, ability);
      case CardAbilityType.DIRECT_DAMAGE:
        return await this.executeDirectDamage(game, gameCard, ability);
      case CardAbilityType.LIFESTEAL:
        return await this.executeLifesteal(game, gameCard, ability);
      case CardAbilityType.RESURRECT:
        return await this.executeResurrect(game, gameCard, ability);
      default:
        console.log(`⚠️  Ability type ${ability.type} not yet implemented`);
        return null;
    }
  }

  private async executeAreaDamage(
    game: Game,
    gameCard: GameCard & { card: any },
    ability: any,
  ): Promise<AbilityExecutionResult> {
    const damage = ability.value || 0;
    const cardsDestroyed: string[] = [];

    // Get all enemy cards in the same row
    const enemyCards = await this.gameCardRepository.find({
      where: {
        gameId: game.id,
        row: gameCard.row,
      },
      relations: ['card'],
    });

    const enemyCardsInRow = enemyCards.filter(c => c.playerId !== gameCard.playerId);

    console.log(`   Targeting ${enemyCardsInRow.length} enemy cards in row ${gameCard.row}`);

    for (const enemyCard of enemyCardsInRow) {
      const defense = enemyCard.card.defense;
      console.log(`   Hitting ${enemyCard.card.name} (${defense} DEF) with ${damage} damage`);

      if (damage >= defense) {
        console.log(`   💀 ${enemyCard.card.name} destroyed!`);
        await this.gameCardRepository.remove(enemyCard);
        cardsDestroyed.push(enemyCard.card.name);
      }
    }

    return {
      message: `${ability.name} dealt ${damage} damage to ${enemyCardsInRow.length} enemy cards!`,
      damageDealt: damage * enemyCardsInRow.length,
      cardsDestroyed,
    };
  }

  private async executeDirectDamage(
    game: Game,
    gameCard: GameCard & { card: any },
    ability: any,
  ): Promise<AbilityExecutionResult> {
    const damage = ability.value || 0;

    // Determine which player to damage
    const isPlayer1 = game.player1Id === gameCard.playerId;
    const targetPlayerId = isPlayer1 ? game.player2Id : game.player1Id;

    console.log(`   Dealing ${damage} direct damage to enemy player`);

    if (isPlayer1) {
      game.player2Health -= damage;
      console.log(`   Player 2 HP: ${game.player2Health + damage} → ${game.player2Health}`);
    } else {
      game.player1Health -= damage;
      console.log(`   Player 1 HP: ${game.player1Health + damage} → ${game.player1Health}`);
    }

    return {
      message: `${ability.name} dealt ${damage} direct damage to enemy player!`,
      damageDealt: damage,
    };
  }

  private async executeLifesteal(
    game: Game,
    gameCard: GameCard & { card: any },
    ability: any,
  ): Promise<AbilityExecutionResult> {
    const healing = ability.value || 0;

    // Determine which player to heal
    const isPlayer1 = game.player1Id === gameCard.playerId;

    console.log(`   Healing player for ${healing} HP`);

    if (isPlayer1) {
      const oldHealth = game.player1Health;
      game.player1Health = Math.min(game.player1Health + healing, 5000);
      const actualHealing = game.player1Health - oldHealth;
      console.log(`   Player 1 HP: ${oldHealth} → ${game.player1Health} (+${actualHealing})`);
    } else {
      const oldHealth = game.player2Health;
      game.player2Health = Math.min(game.player2Health + healing, 5000);
      const actualHealing = game.player2Health - oldHealth;
      console.log(`   Player 2 HP: ${oldHealth} → ${game.player2Health} (+${actualHealing})`);
    }

    return {
      message: `${ability.name} healed ${healing} HP!`,
      healingDone: healing,
    };
  }

  private async executeResurrect(
    game: Game,
    gameCard: GameCard & { card: any },
    ability: any,
  ): Promise<AbilityExecutionResult> {
    // Determine which player's hand to return to
    const isPlayer1 = game.player1Id === gameCard.playerId;
    const hand = isPlayer1 ? game.player1Hand : game.player2Hand;

    // Check if already used
    const usesPerGame = ability.usesPerGame || 999;
    // TODO: Track ability uses per game (need additional state)
    // For now, just add back to hand

    console.log(`   Returning ${gameCard.card.name} to hand`);
    hand.push(gameCard.cardId);

    if (isPlayer1) {
      game.player1Hand = hand;
    } else {
      game.player2Hand = hand;
    }

    return {
      message: `${ability.name} returned ${gameCard.card.name} to hand!`,
      cardResurrected: true,
    };
  }
}
