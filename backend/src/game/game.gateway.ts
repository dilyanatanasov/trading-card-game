import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { JwtService } from '@nestjs/jwt';
import { GameActionType } from './dto/game-action.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private gameService: GameService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    console.log('WebSocket connection attempt:', client.id);
    try {
      const token = client.handshake.auth.token;
      console.log('Token present:', !!token);
      if (!token) {
        console.log('No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub; // JWT uses 'sub' field for user ID

      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      console.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    try {
      const game = await this.gameService.joinGame(data.gameId, userId);

      // Join the game room
      client.join(`game:${data.gameId}`);

      // Notify all players in the game
      this.server.to(`game:${data.gameId}`).emit('gameUpdated', game);

      return { success: true, game };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('placeCard')
  async handlePlaceCard(
    @MessageBody() data: { gameId: string; cardId: string; position: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    try {
      const game = await this.gameService.placeCard(data.gameId, userId, {
        cardId: data.cardId,
        position: data.position,
      });

      // Notify all players in the game
      this.server.to(`game:${data.gameId}`).emit('gameUpdated', game);

      return { success: true, game };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('performAction')
  async handlePerformAction(
    @MessageBody()
    data: {
      gameId: string;
      action: string;
      cardId: string;
      targetCardId?: string;
      newMode?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    try {
      const game = await this.gameService.performAction(data.gameId, userId, {
        action: data.action as GameActionType,
        gameCardId: data.cardId,
        targetCardId: data.targetCardId,
        newMode: data.newMode as any,
      });

      // Notify all players in the game
      this.server.to(`game:${data.gameId}`).emit('gameUpdated', game);

      return { success: true, game };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('endTurn')
  async handleEndTurn(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    try {
      const game = await this.gameService.endTurn(data.gameId, userId);

      // Notify all players in the game
      this.server.to(`game:${data.gameId}`).emit('gameUpdated', game);

      return { success: true, game };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('subscribeToGame')
  async handleSubscribeToGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`game:${data.gameId}`);

    // Send current game state
    try {
      const game = await this.gameService.getGame(data.gameId);
      client.emit('gameUpdated', game);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('unsubscribeFromGame')
  handleUnsubscribeFromGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`game:${data.gameId}`);
    return { success: true };
  }

  @SubscribeMessage('forfeitGame')
  async handleForfeitGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    try {
      const game = await this.gameService.forfeitGame(data.gameId, userId);

      // Notify all players in the game
      this.server.to(`game:${data.gameId}`).emit('gameUpdated', game);

      return { success: true, game };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
