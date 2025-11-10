import { useState, useEffect } from 'react';
import { Game, GameCard, Card, CardMode, GameStatus } from '../types';
import { gameAPI, cardsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { gameSocket } from '../services/socket';
import DeckDisplay from './DeckDisplay';

interface GameBoardProps {
  game: Game;
  onRefresh: () => void;
  onExit: () => void;
}

export default function GameBoard({ game: initialGame, onRefresh, onExit }: GameBoardProps) {
  const { user } = useAuth();
  const [game, setGame] = useState<Game>(initialGame);
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedBoardCard, setSelectedBoardCard] = useState<GameCard | null>(null);
  const [actionMode, setActionMode] = useState<'place' | 'attack' | 'switch' | null>(null);
  const [placementMode, setPlacementMode] = useState<CardMode>(CardMode.ATTACK);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isMyTurn = game.currentTurnPlayerId === user?.id;
  const isPlayer1 = game.player1Id === user?.id;
  const myHealth = isPlayer1 ? game.player1Health : game.player2Health;
  const opponentHealth = isPlayer1 ? game.player2Health : game.player1Health;
  const opponent = isPlayer1 ? game.player2 : game.player1;
  const myDeckSize = isPlayer1 ? (game.player1Deck?.length || 0) : (game.player2Deck?.length || 0);
  const opponentDeckSize = isPlayer1 ? (game.player2Deck?.length || 0) : (game.player1Deck?.length || 0);
  const myHandCardIds = isPlayer1 ? (game.player1Hand || []) : (game.player2Hand || []);

  useEffect(() => {
    setGame(initialGame);
  }, [initialGame]);

  useEffect(() => {
    loadHandCards();

    // Subscribe to real-time game updates
    const handleGameUpdate = (updatedGame: Game) => {
      setGame(updatedGame);
      setLoading(false);

      // Clear selections after update
      if (updatedGame.currentTurnPlayerId !== user?.id) {
        setActionMode(null);
        setSelectedBoardCard(null);
      }
    };

    gameSocket.subscribeToGame(game.id, handleGameUpdate);

    return () => {
      gameSocket.unsubscribeFromGame(game.id, handleGameUpdate);
    };
  }, [game.id, user?.id]);

  // Load cards when hand card IDs change
  useEffect(() => {
    loadHandCards();
  }, [myHandCardIds.length]);

  const loadHandCards = async () => {
    try {
      if (myHandCardIds.length === 0) {
        setHandCards([]);
        return;
      }

      // Fetch the actual card data for cards in hand
      const cardPromises = myHandCardIds.map(cardId =>
        cardsAPI.getOne(cardId).catch(() => null)
      );
      const cards = await Promise.all(cardPromises);
      const validCards = cards.filter((c): c is { data: Card } => c !== null).map(c => c.data);
      setHandCards(validCards);
    } catch (err: any) {
      setError('Failed to load hand cards');
    }
  };

  const placeCard = async (position: number) => {
    if (!selectedCard || !isMyTurn) return;

    setLoading(true);
    setError(null);
    try {
      const result = await gameSocket.placeCard(game.id, selectedCard.id, position, placementMode);
      if (result.success) {
        setSelectedCard(null);
        setActionMode(null);
        setPlacementMode(CardMode.ATTACK); // Reset to attack mode
      } else {
        setError(result.error || 'Failed to place card');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place card');
      setLoading(false);
    }
  };

  const switchMode = async (newMode: CardMode) => {
    if (!selectedBoardCard || !isMyTurn) return;

    setLoading(true);
    setError(null);
    try {
      const result = await gameSocket.performAction(
        game.id,
        'switch_mode',
        selectedBoardCard.id,
        undefined,
        newMode
      );
      if (result.success) {
        setSelectedBoardCard(null);
        setActionMode(null);
      } else {
        setError(result.error || 'Failed to switch mode');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch mode');
      setLoading(false);
    }
  };

  const attack = async (targetCardId?: string) => {
    if (!selectedBoardCard || !isMyTurn) return;

    setLoading(true);
    setError(null);
    try {
      const result = await gameSocket.performAction(
        game.id,
        'attack',
        selectedBoardCard.id,
        targetCardId
      );
      if (result.success) {
        setSelectedBoardCard(null);
        setActionMode(null);
      } else {
        setError(result.error || 'Failed to attack');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to attack');
      setLoading(false);
    }
  };

  const endTurn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await gameSocket.endTurn(game.id);
      if (result.success) {
        setSelectedCard(null);
        setSelectedBoardCard(null);
        setActionMode(null);
      } else {
        setError(result.error || 'Failed to end turn');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to end turn');
      setLoading(false);
    }
  };

  const forfeitGame = async () => {
    if (!confirm('Are you sure you want to forfeit? This will count as a loss.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await gameSocket.forfeitGame(game.id);
      if (result.success) {
        // Navigate back to battle view after forfeiting
        setTimeout(() => {
          onExit();
        }, 1000);
      } else {
        setError(result.error || 'Failed to forfeit game');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to forfeit game');
      setLoading(false);
    }
  };

  const renderBoardSlot = (position: number, row: number) => {
    const cardInSlot = game.board?.find(
      (c) => c.position === position && c.row === row
    );
    const isMyRow = (row === 0 && isPlayer1) || (row === 1 && !isPlayer1);
    const canPlace = actionMode === 'place' && isMyRow && !cardInSlot && isMyTurn;
    const isSelected = cardInSlot && selectedBoardCard?.id === cardInSlot.id;

    return (
      <div key={`${row}-${position}`} className="relative">
        <div
          onClick={() => {
            if (canPlace) {
              placeCard(position);
            } else if (cardInSlot && isMyRow && isMyTurn) {
              // Clicking own card - show actions immediately
              setSelectedBoardCard(cardInSlot);
              setActionMode(null);
              setSelectedCard(null);
            } else if (cardInSlot && !isMyRow && actionMode === 'attack') {
              attack(cardInSlot.id);
            }
          }}
          className={`
            aspect-[2/3] rounded-lg border-2 transition-all cursor-pointer
            ${canPlace ? 'border-green-500 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/40' : ''}
            ${!cardInSlot ? 'border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' : ''}
            ${isSelected ? 'ring-4 ring-purple-500' : ''}
            ${cardInSlot && !isMyRow && actionMode === 'attack' ? 'border-red-500 hover:bg-red-100 dark:hover:bg-red-900/20' : ''}
          `}
        >
          {cardInSlot && cardInSlot.card ? (
            <div className="h-full flex items-center justify-center overflow-visible">
              <div className={`h-full w-full flex flex-col p-2 bg-white dark:bg-gray-800 rounded-lg transition-transform shadow-lg ${cardInSlot.mode === CardMode.DEFENSE ? 'rotate-90 scale-90' : ''}`}>
                <div className="text-xs font-bold truncate mb-1">{cardInSlot.card.name}</div>
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={cardInSlot.card.imageUrl}
                    alt={cardInSlot.card.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-red-600 dark:text-red-400">⚔️{cardInSlot.card.attack}</span>
                  <span className="text-blue-600 dark:text-blue-400">🛡️{cardInSlot.card.defense}</span>
                </div>
                <div className="text-xs text-center mt-1">
                  {cardInSlot.mode === CardMode.ATTACK ? '⚔️ ATK' : '🛡️ DEF'}
                </div>
                {cardInSlot.hasActedThisTurn && (
                  <div className="text-xs text-gray-500 text-center">Used</div>
                )}
              </div>
            </div>
          ) : cardInSlot && !cardInSlot.card ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : canPlace ? (
            <div className="h-full flex items-center justify-center text-sm text-green-600 dark:text-green-400">
              Place Here
            </div>
          ) : null}
        </div>

        {/* Action Popup - appears below selected card */}
        {isSelected && isMyRow && isMyTurn && (
          <div className="absolute top-full left-0 right-0 mt-1 z-10 p-2 bg-purple-100 dark:bg-purple-900/80 rounded-lg border-2 border-purple-500 shadow-lg">
            <div className="flex flex-col gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  switchMode(selectedBoardCard.mode === CardMode.ATTACK ? CardMode.DEFENSE : CardMode.ATTACK);
                }}
                disabled={loading || selectedBoardCard.hasActedThisTurn}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedBoardCard.mode === CardMode.ATTACK ? '🛡️ DEF' : '⚔️ ATK'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionMode('attack');
                }}
                disabled={loading || selectedBoardCard.hasActedThisTurn}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⚔️ Attack
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBoardCard(null);
                  setActionMode(null);
                }}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Attack mode - show direct attack if no opponent cards */}
            {actionMode === 'attack' && (() => {
              const opponentRow = isPlayer1 ? 1 : 0;
              const opponentCards = game.board?.filter(c => c.row === opponentRow) || [];
              if (opponentCards.length === 0) {
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      attack();
                    }}
                    disabled={loading}
                    className="mt-1 w-full px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🎯 Direct ({selectedBoardCard.card.attack})
                  </button>
                );
              }
              return (
                <div className="mt-1 text-xs text-center text-gray-700 dark:text-gray-300">
                  Click opponent card
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  if (game.status === GameStatus.WAITING) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Waiting for Opponent
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            Your battle is ready! Waiting for another player to join...
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onRefresh}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transform transition hover:scale-105"
            >
              Refresh
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow transform transition hover:scale-105"
            >
              Cancel & Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (game.status === GameStatus.FINISHED) {
    const didIWin = game.winnerId === user?.id;
    const winnerHealth = game.winnerId === game.player1Id ? game.player1Health : game.player2Health;
    const loserHealth = game.winnerId === game.player1Id ? game.player2Health : game.player1Health;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">{didIWin ? '🏆' : '💀'}</div>
            <h2 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {didIWin ? 'Victory!' : 'Defeat'}
            </h2>
            <p className="text-2xl text-gray-700 dark:text-gray-300">
              {game.winner?.username} wins the battle!
            </p>
          </div>

          {/* Battle Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
              Battle Summary
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Winner Stats */}
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 border-2 border-green-500">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Winner</div>
                <div className="text-lg font-bold text-green-700 dark:text-green-400">
                  {game.winner?.username}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  HP Remaining: <span className="font-bold text-green-600 dark:text-green-400">{winnerHealth}</span>
                </div>
              </div>

              {/* Loser Stats */}
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 border-2 border-red-500">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Defeated</div>
                <div className="text-lg font-bold text-red-700 dark:text-red-400">
                  {game.winnerId === game.player1Id ? game.player2?.username : game.player1?.username}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  HP Remaining: <span className="font-bold text-red-600 dark:text-red-400">{loserHealth}</span>
                </div>
              </div>
            </div>

            {/* Game Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {game.turnNumber || 1}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Turns</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {Math.abs((winnerHealth || 0) - (loserHealth || 0))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">HP Difference</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onExit}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Return to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Opponent</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {opponent?.username || 'Waiting...'}
          </div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            ❤️ {opponentHealth} HP
          </div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${isMyTurn ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isMyTurn ? '🎯 Your Turn' : '⏳ Opponent\'s Turn'}
          </div>
        </div>
        <div className="flex-1 text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">You</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {user?.username}
          </div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            ❤️ {myHealth} HP
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex gap-4">
        {/* LEFT COLUMN - Player's Hand (Vertical) */}
        <div className="w-48 flex-shrink-0">
          <div className="sticky top-4">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 text-center">
              Your Hand ({handCards.length})
            </div>
            {selectedCard && actionMode === 'place' && (
              <div className="text-xs text-green-600 dark:text-green-400 mb-2 text-center">
                Click a slot to place
              </div>
            )}
            <div className="flex flex-col gap-3 max-h-[calc(100vh-250px)] overflow-y-auto p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
              {handCards.map((card) => (
                <div key={card.id} className="relative">
                  <div
                    onClick={() => {
                      if (isMyTurn) {
                        setSelectedCard(card);
                        setActionMode('place');
                        setSelectedBoardCard(null);
                      }
                    }}
                    className={`
                      rounded-lg border-2 transition-all p-1 flex-shrink-0
                      ${selectedCard?.id === card.id && actionMode === 'place' ? 'border-green-500 ring-2 ring-green-500' : 'border-gray-300 dark:border-gray-700'}
                      ${isMyTurn ? 'cursor-pointer hover:border-green-400 hover:shadow-lg' : 'cursor-not-allowed opacity-50'}
                    `}
                  >
                    <div className="flex flex-col bg-white dark:bg-gray-800 rounded">
                      <div className="text-xs font-bold truncate px-1 py-0.5">{card.name}</div>
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="flex justify-between text-xs px-1 py-0.5">
                        <span className="text-red-600 dark:text-red-400">⚔️{card.attack}</span>
                        <span className="text-blue-600 dark:text-blue-400">🛡️{card.defense}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mode Selection Popup */}
                  {selectedCard?.id === card.id && actionMode === 'place' && isMyTurn && (
                    <div className="mt-1 p-1 bg-purple-100 dark:bg-purple-900/50 rounded border border-purple-500">
                      <div className="text-xs font-semibold mb-1 text-center text-gray-700 dark:text-gray-300">Mode:</div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlacementMode(CardMode.ATTACK);
                          }}
                          className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition ${
                            placementMode === CardMode.ATTACK
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          ⚔️ ATK
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlacementMode(CardMode.DEFENSE);
                          }}
                          className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition ${
                            placementMode === CardMode.DEFENSE
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white'
                          }`}
                        >
                          🛡️ DEF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-center">
              <DeckDisplay deckSize={myDeckSize} label="Your Deck" />
            </div>
          </div>
        </div>

        {/* CENTER COLUMN - Game Board & Controls */}
        <div className="flex-1 min-w-0">
          {/* Opponent's Board */}
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Opponent's Field
            </div>
            <div className="grid grid-cols-5 gap-3 py-4">
              {Array.from({ length: 5 }, (_, i) => renderBoardSlot(i, isPlayer1 ? 1 : 0))}
            </div>
          </div>

          {/* My Board */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Your Field
            </div>
            <div className="grid grid-cols-5 gap-3 py-4">
              {Array.from({ length: 5 }, (_, i) => renderBoardSlot(i, isPlayer1 ? 0 : 1))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={endTurn}
              disabled={!isMyTurn || loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Processing...' : 'End Turn'}
            </button>
            <button
              onClick={onRefresh}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Refresh
            </button>
            <button
              onClick={forfeitGame}
              disabled={loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Forfeit
            </button>
            <button
              onClick={onExit}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Exit
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - Opponent's Deck */}
        <div className="w-48 flex-shrink-0">
          <div className="sticky top-4">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 text-center">
              Opponent
            </div>
            <div className="flex justify-center">
              <DeckDisplay deckSize={opponentDeckSize} label="Opponent's Deck" isOpponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
