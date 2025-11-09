export interface User {
  id: string;
  email: string;
  username: string;
  coins: number;
  createdAt: string;
  updatedAt?: string;
}

export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface Card {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: CardRarity;
  baseValue: number;
  attack: number;
  defense: number;
  category?: string;
  createdAt: string;
}

export interface UserCard {
  id: string;
  userId: string;
  cardId: string;
  card: Card;
  quantity: number;
  isFavorite: boolean;
  acquiredAt: string;
}

export enum TradeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface Trade {
  id: string;
  initiatorId: string;
  receiverId: string;
  initiator?: User;
  receiver?: User;
  offeredCardIds: string[];
  requestedCardIds: string[];
  status: TradeStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Gift {
  id: string;
  senderId: string;
  receiverId: string;
  sender?: User;
  receiver?: User;
  cardId: string;
  message?: string;
  claimed: boolean;
  claimedAt?: string;
  createdAt: string;
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  seller?: User;
  cardId: string;
  price: number;
  status: ListingStatus;
  buyerId?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

export enum CardMode {
  ATTACK = 'attack',
  DEFENSE = 'defense',
}

export interface GameCard {
  id: string;
  gameId: string;
  cardId: string;
  card: Card;
  playerId: string;
  position: number;
  row: number;
  mode: CardMode;
  hasActedThisTurn: boolean;
}

export interface Game {
  id: string;
  player1Id: string;
  player1: User;
  player2Id?: string;
  player2?: User;
  player1Health: number;
  player2Health: number;
  status: GameStatus;
  currentTurnPlayerId?: string;
  winnerId?: string;
  winner?: User;
  board: GameCard[];
  createdAt: string;
  updatedAt: string;
}

export interface GameRecord {
  id: string;
  userId: string;
  wins: number;
  losses: number;
  totalGames: number;
  createdAt: string;
}
