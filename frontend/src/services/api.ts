import axios, { AxiosInstance } from 'axios';
import type {
  User,
  Card,
  UserCard,
  Trade,
  Gift,
  MarketplaceListing,
  AuthResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: {
    email: string;
    username: string;
    password: string;
  }) => api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  getProfile: () => api.get<User>('/auth/profile'),
};

// Cards
export const cardsAPI = {
  getAll: () => api.get<Card[]>('/cards'),
  getOne: (id: string) => api.get<Card>(`/cards/${id}`),
  getMyCollection: () => api.get<UserCard[]>('/cards/my-collection'),
  toggleFavorite: (cardId: string) =>
    api.patch<UserCard>(`/cards/${cardId}/favorite`),
};

// Trades
export const tradesAPI = {
  create: (data: {
    receiverId: string;
    offeredCardIds: string[];
    requestedCardIds: string[];
    message?: string;
  }) => api.post<Trade>('/trades', data),
  getAll: () => api.get<Trade[]>('/trades'),
  getOne: (id: string) => api.get<Trade>(`/trades/${id}`),
  accept: (id: string) => api.patch<Trade>(`/trades/${id}/accept`),
  reject: (id: string) => api.patch<Trade>(`/trades/${id}/reject`),
  cancel: (id: string) => api.patch<Trade>(`/trades/${id}/cancel`),
};

// Gifts
export const giftsAPI = {
  send: (data: { receiverId: string; cardId: string; message?: string }) =>
    api.post<Gift>('/gifts', data),
  getReceived: () => api.get<Gift[]>('/gifts/received'),
  getSent: () => api.get<Gift[]>('/gifts/sent'),
  claim: (id: string) => api.patch<Gift>(`/gifts/${id}/claim`),
};

// Marketplace
export const marketplaceAPI = {
  create: (data: { cardId: string; price: number }) =>
    api.post<MarketplaceListing>('/marketplace', data),
  getAll: () => api.get<MarketplaceListing[]>('/marketplace'),
  getMyListings: () =>
    api.get<MarketplaceListing[]>('/marketplace/my-listings'),
  getOne: (id: string) => api.get<MarketplaceListing>(`/marketplace/${id}`),
  buy: (id: string) =>
    api.post<MarketplaceListing>(`/marketplace/${id}/buy`),
  cancel: (id: string) =>
    api.patch<MarketplaceListing>(`/marketplace/${id}/cancel`),
};

// Users
export const usersAPI = {
  getAll: () => api.get<User[]>('/users'),
  getOne: (id: string) => api.get<User>(`/users/${id}`),
  getByUsername: (username: string) =>
    api.get<User>(`/users/username/${username}`),
};

// Game
export const gameAPI = {
  createGame: (data?: { player2Id?: string }) =>
    api.post('/game', data),
  joinGame: (gameId: string) =>
    api.post(`/game/${gameId}/join`),
  getAvailableGames: () =>
    api.get('/game/available'),
  getMyGames: () =>
    api.get('/game/my-games'),
  getGame: (gameId: string) =>
    api.get(`/game/${gameId}`),
  placeCard: (gameId: string, data: { cardId: string; position: number }) =>
    api.post(`/game/${gameId}/place-card`, data),
  performAction: (gameId: string, data: {
    gameCardId: string;
    action: 'switch_mode' | 'attack';
    newMode?: 'attack' | 'defense';
    targetCardId?: string;
  }) => api.post(`/game/${gameId}/action`, data),
  endTurn: (gameId: string) =>
    api.post(`/game/${gameId}/end-turn`),
  getMyRecord: () =>
    api.get('/game/records/me'),
  getPlayerRecord: (userId: string) =>
    api.get(`/game/records/${userId}`),
};

export default api;
