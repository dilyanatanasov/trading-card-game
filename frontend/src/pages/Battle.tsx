import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { Game, GameStatus } from '../types';
import GameBoard from '../components/GameBoard';

export default function Battle() {
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to restore the current game from localStorage
    const savedGameId = localStorage.getItem('currentGameId');
    if (savedGameId) {
      loadSavedGame(savedGameId);
    }

    loadGames();
    // Auto-refresh games every 5 seconds
    const interval = setInterval(loadGames, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSavedGame = async (gameId: string) => {
    try {
      const response = await gameAPI.getGame(gameId);
      if (response.data.status !== GameStatus.FINISHED) {
        setCurrentGame(response.data);
      } else {
        // Game is finished, remove from localStorage
        localStorage.removeItem('currentGameId');
      }
    } catch (err: any) {
      // Game not found or error, remove from localStorage
      localStorage.removeItem('currentGameId');
    }
  };

  const loadGames = async () => {
    await Promise.all([loadAvailableGames(), loadMyGames()]);
  };

  const loadAvailableGames = async () => {
    try {
      const response = await gameAPI.getAvailableGames();
      setAvailableGames(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load games');
    }
  };

  const loadMyGames = async () => {
    try {
      const response = await gameAPI.getMyGames();
      setMyGames(response.data);
    } catch (err: any) {
      // Silently fail for my games
    }
  };

  const createNewGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.createGame();
      setCurrentGame(response.data);
      localStorage.setItem('currentGameId', response.data.id);
      // Refresh games list
      await loadGames();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.joinGame(gameId);
      setCurrentGame(response.data);
      localStorage.setItem('currentGameId', response.data.id);
      // Refresh games list
      await loadGames();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  const refreshGame = async () => {
    if (!currentGame) return;
    try {
      const response = await gameAPI.getGame(currentGame.id);
      setCurrentGame(response.data);

      // Clear localStorage if game is finished
      if (response.data.status === GameStatus.FINISHED) {
        localStorage.removeItem('currentGameId');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to refresh game');
    }
  };

  if (currentGame) {
    return (
      <GameBoard
        game={currentGame}
        onRefresh={refreshGame}
        onExit={() => {
          setCurrentGame(null);
          localStorage.removeItem('currentGameId');
          loadGames(); // Refresh both available games and my games
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Card Battle Arena
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Create a new game or join an existing battle
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={createNewGame}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? 'Creating...' : 'Create New Battle'}
        </button>
      </div>

      {myGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            My Active Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGames.map((game) => (
              <div
                key={game.id}
                className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-md rounded-lg border-2 border-purple-400 dark:border-purple-600 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {game.status === GameStatus.WAITING ? 'Waiting for opponent' : 'Battle in progress'}
                  </div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    vs {game.player2?.username || '...'}
                  </div>
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Your HP
                    </div>
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {game.player1Id === game.player1.id ? game.player1Health : game.player2Health}
                    </div>
                  </div>
                  <div className="text-3xl">
                    {game.status === GameStatus.WAITING ? '⏳' : '⚔️'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentGame(game);
                    localStorage.setItem('currentGameId', game.id);
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {game.status === GameStatus.WAITING ? 'Enter Lobby' : 'Resume Battle'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Join an Open Battle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableGames.map((game) => (
              <div
                key={game.id}
                className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Host:
                  </div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {game.player1.username}
                  </div>
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </div>
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Waiting
                    </div>
                  </div>
                  <div className="text-3xl">⚔️</div>
                </div>
                <button
                  onClick={() => joinGame(game.id)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Joining...' : 'Join Battle'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableGames.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <div className="text-6xl mb-4">⚔️</div>
          <div className="text-xl">No open battles available</div>
          <div className="text-sm mt-2">Create one to get started!</div>
        </div>
      )}
    </div>
  );
}
