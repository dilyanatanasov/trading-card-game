export enum CardAbilityType {
  // Damage abilities
  AREA_DAMAGE = 'area_damage', // Deal damage to multiple targets
  DIRECT_DAMAGE = 'direct_damage', // Deal damage to player directly
  BURN = 'burn', // Deal damage over time

  // Defensive abilities
  SHIELD = 'shield', // Block next attack
  REGENERATION = 'regeneration', // Heal over time
  REFLECT = 'reflect', // Return damage to attacker

  // Utility abilities
  DRAW_CARD = 'draw_card', // Draw additional cards
  RESURRECT = 'resurrect', // Return to hand when destroyed
  BUFF_ADJACENT = 'buff_adjacent', // Boost adjacent cards
  BUFF_RACE = 'buff_race', // Boost cards of same race

  // Control abilities
  STUN = 'stun', // Prevent card from acting
  FREEZE = 'freeze', // Skip opponent's next turn
  DESTROY = 'destroy', // Instantly destroy target card

  // Special abilities
  LIFESTEAL = 'lifesteal', // Heal when dealing damage
  DOUBLE_STRIKE = 'double_strike', // Attack twice
  PIERCE = 'pierce', // Damage ignores defense
}

export enum CardAbilityTrigger {
  ON_PLAY = 'on_play', // When card is placed
  ON_ATTACK = 'on_attack', // When card attacks
  ON_DESTROY = 'on_destroy', // When card is destroyed
  ON_DAMAGED = 'on_damaged', // When card takes damage
  ON_TURN_START = 'on_turn_start', // At start of your turn
  ON_TURN_END = 'on_turn_end', // At end of your turn
  PASSIVE = 'passive', // Always active
  ACTIVATED = 'activated', // Can be manually activated
}

export interface CardAbility {
  id: string;
  name: string;
  description: string;
  type: CardAbilityType;
  trigger: CardAbilityTrigger;
  value?: number; // Numeric value for damage/heal amounts
  target?: 'self' | 'adjacent' | 'row' | 'all' | 'enemy_row' | 'enemy_all' | 'player';
  cooldown?: number; // Turns before can use again
  usesPerGame?: number; // Limited uses
}
