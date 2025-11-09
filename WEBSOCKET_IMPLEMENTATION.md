# Real-Time Battle System with WebSockets

## Overview
Implemented real-time battle updates using Socket.IO for instant synchronization between players without polling.

## Changes Made

### Backend

#### 1. Dependencies Added
- `@nestjs/websockets@^10.0.0`
- `@nestjs/platform-socket.io@^10.0.0`
- `socket.io`

#### 2. New Files
- **`backend/src/game/game.gateway.ts`**: WebSocket gateway handling real-time game events
  - `joinGame`: Player joins a game
  - `placeCard`: Place a card on the board
  - `performAction`: Attack or switch mode
  - `endTurn`: End current turn
  - `subscribeToGame`: Subscribe to game updates
  - `unsubscribeFromGame`: Unsubscribe from game updates

#### 3. Updated Files
- **`backend/src/game/game.module.ts`**:
  - Added `JwtModule` for WebSocket authentication
  - Added `GameGateway` to providers

### Frontend

#### 1. Dependencies Added
- `socket.io-client`

#### 2. New Files
- **`frontend/src/services/socket.ts`**: WebSocket service client
  - Manages WebSocket connection
  - Handles authentication with JWT token
  - Provides methods for all game actions
  - Manages game subscriptions for real-time updates

#### 3. Updated Files
- **`frontend/src/context/AuthContext.tsx`**:
  - Connects WebSocket when user logs in
  - Disconnects WebSocket when user logs out
  - Reconnects WebSocket on app reload if user is authenticated

- **`frontend/src/components/GameBoard.tsx`**:
  - Replaced polling with WebSocket subscriptions
  - All game actions now use WebSocket instead of REST API
  - Real-time updates automatically refresh game state
  - Removed 3-second polling interval

## Benefits

1. **Instant Updates**: Changes appear immediately on both players' screens
2. **No Polling Overhead**: Eliminates constant HTTP requests every 3 seconds
3. **Better UX**: Smoother gameplay with real-time synchronization
4. **Lower Server Load**: WebSocket connections are more efficient than constant polling
5. **Scalable**: Socket.IO supports rooms for isolated game instances

## How It Works

1. User logs in → WebSocket connection established with JWT authentication
2. Player joins/creates game → Subscribes to game room
3. Player performs action → WebSocket event sent to server
4. Server processes action → Broadcasts update to all players in game room
5. All subscribed clients receive update → UI updates automatically
6. Player leaves game → Unsubscribes from game room

## Testing

To test real-time updates:
1. Open the app in two different browsers/tabs
2. Login with different users
3. Create a game with one user
4. Join the game with the second user
5. Make moves → observe instant updates on both screens

## WebSocket Events

### Client → Server
- `joinGame(gameId)` - Join a game
- `placeCard(gameId, cardId, position)` - Place a card
- `performAction(gameId, action, cardId, targetCardId)` - Attack or switch mode
- `endTurn(gameId)` - End turn
- `subscribeToGame(gameId)` - Subscribe to game updates
- `unsubscribeFromGame(gameId)` - Unsubscribe from updates

### Server → Client
- `gameUpdated(game)` - Game state changed
- `connect` - WebSocket connected
- `disconnect` - WebSocket disconnected
- `connect_error` - Connection error

## Architecture

```
User Action (Frontend)
    ↓
GameSocket Service
    ↓
WebSocket Client (Socket.IO)
    ↓
[Network - WebSocket Connection]
    ↓
WebSocket Server (Socket.IO)
    ↓
GameGateway
    ↓
GameService (Business Logic)
    ↓
Database
    ↓
GameGateway
    ↓
Broadcast to Game Room
    ↓
All Connected Clients in Room
    ↓
Auto-update UI
```

## Security

- JWT token authentication on WebSocket connection
- User ID extracted from JWT token
- All actions validated against user permissions
- Game rooms isolated - only players in the game receive updates
