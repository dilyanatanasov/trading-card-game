import { io, Socket } from 'socket.io-client';
import { Game } from '../types';

console.log('socket.ts module loaded');

class GameSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(game: Game) => void>> = new Map();

  connect(token: string) {
    console.log('GameSocket: Attempting to connect with token:', token ? 'present' : 'missing');

    if (this.socket?.connected) {
      console.log('GameSocket: Already connected, skipping');
      return;
    }

    console.log('GameSocket: Creating new socket connection to http://localhost:3000');
    this.socket = io('http://localhost:3000', {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('gameUpdated', (game: Game) => {
      console.log('Game updated via WebSocket:', game.id);
      const gameListeners = this.listeners.get(game.id);
      if (gameListeners) {
        gameListeners.forEach(callback => callback(game));
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      alert(`WebSocket connection error: ${error.message}`);
    });

    console.log('GameSocket: Event listeners registered');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  subscribeToGame(gameId: string, callback: (game: Game) => void) {
    if (!this.listeners.has(gameId)) {
      this.listeners.set(gameId, new Set());
    }
    this.listeners.get(gameId)!.add(callback);

    if (this.socket?.connected) {
      this.socket.emit('subscribeToGame', { gameId });
    }
  }

  unsubscribeFromGame(gameId: string, callback?: (game: Game) => void) {
    if (callback) {
      const gameListeners = this.listeners.get(gameId);
      if (gameListeners) {
        gameListeners.delete(callback);
        if (gameListeners.size === 0) {
          this.listeners.delete(gameId);
        }
      }
    } else {
      this.listeners.delete(gameId);
    }

    if (this.socket?.connected) {
      this.socket.emit('unsubscribeFromGame', { gameId });
    }
  }

  joinGame(gameId: string): Promise<{ success: boolean; game?: Game; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('joinGame', { gameId }, (response: any) => {
        resolve(response);
      });
    });
  }

  placeCard(
    gameId: string,
    cardId: string,
    position: number,
    mode?: string
  ): Promise<{ success: boolean; game?: Game; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('placeCard', { gameId, cardId, position, mode }, (response: any) => {
        resolve(response);
      });
    });
  }

  performAction(
    gameId: string,
    action: 'attack' | 'switch_mode',
    cardId: string,
    targetCardId?: string,
    newMode?: string
  ): Promise<{ success: boolean; game?: Game; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit(
        'performAction',
        { gameId, action, cardId, targetCardId, newMode },
        (response: any) => {
          resolve(response);
        }
      );
    });
  }

  endTurn(gameId: string): Promise<{ success: boolean; game?: Game; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('endTurn', { gameId }, (response: any) => {
        resolve(response);
      });
    });
  }

  forfeitGame(gameId: string): Promise<{ success: boolean; game?: Game; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('forfeitGame', { gameId }, (response: any) => {
        resolve(response);
      });
    });
  }

  drawCard(gameId: string, count: number = 1): Promise<{ success: boolean; game?: Game; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      this.socket.emit('drawCard', { gameId, count }, (response: any) => {
        resolve(response);
      });
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const gameSocket = new GameSocketService();
