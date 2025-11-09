import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tradesAPI, usersAPI, cardsAPI } from '../services/api';
import type { Trade, User, UserCard } from '../types';

export default function Trading() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTrade, setShowCreateTrade] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState('');
  const [offeredCards, setOfferedCards] = useState<string[]>([]);
  const [requestedCards, setRequestedCards] = useState<string[]>([]);
  const [tradeMessage, setTradeMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tradesRes, usersRes, cardsRes] = await Promise.all([
        tradesAPI.getAll(),
        usersAPI.getAll(),
        cardsAPI.getMyCollection(),
      ]);
      setTrades(tradesRes.data);
      setUsers(usersRes.data);
      setMyCards(cardsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await tradesAPI.accept(id);
      toast.success('Trade accepted!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept trade');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await tradesAPI.reject(id);
      toast.success('Trade rejected');
      loadData();
    } catch (error) {
      toast.error('Failed to reject trade');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await tradesAPI.cancel(id);
      toast.success('Trade cancelled');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel trade');
    }
  };

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReceiver || offeredCards.length === 0 || requestedCards.length === 0) {
      toast.error('Please select a user and at least one card from each side');
      return;
    }

    try {
      await tradesAPI.create({
        receiverId: selectedReceiver,
        offeredCardIds: offeredCards,
        requestedCardIds: requestedCards,
        message: tradeMessage,
      });
      toast.success('Trade offer sent!');
      setShowCreateTrade(false);
      setSelectedReceiver('');
      setOfferedCards([]);
      setRequestedCards([]);
      setTradeMessage('');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create trade');
    }
  };

  const toggleOfferedCard = (cardId: string) => {
    setOfferedCards(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const toggleRequestedCard = (cardId: string) => {
    setRequestedCards(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const myUserId = users.find(u => u.email)?.id;
  const otherUsers = users.filter(u => u.id !== myUserId);
  const pendingTrades = trades.filter((t) => t.status === 'pending');
  const completedTrades = trades.filter((t) => t.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading</h1>
          <p className="mt-2 text-gray-600">Manage your card trades</p>
        </div>
        <button
          onClick={() => setShowCreateTrade(!showCreateTrade)}
          className="btn btn-primary"
        >
          {showCreateTrade ? 'Cancel' : 'Create Trade'}
        </button>
      </div>

      {showCreateTrade && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Create New Trade</h2>
          <form onSubmit={handleCreateTrade} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Trade With</label>
              <select
                value={selectedReceiver}
                onChange={(e) => setSelectedReceiver(e.target.value)}
                className="input"
                required
              >
                <option value="">Choose a user...</option>
                {otherUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cards You're Offering ({offeredCards.length} selected)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                {myCards.map((userCard) => (
                  <div
                    key={userCard.id}
                    onClick={() => toggleOfferedCard(userCard.cardId)}
                    className={`cursor-pointer p-2 rounded border-2 transition-all ${
                      offeredCards.includes(userCard.cardId)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{userCard.card.name}</p>
                    <p className="text-xs text-gray-500">{userCard.card.rarity}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cards You Want ({requestedCards.length} selected)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Note: You'll need to know which cards the other user has
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                {myCards.map((userCard) => (
                  <div
                    key={userCard.id}
                    onClick={() => toggleRequestedCard(userCard.cardId)}
                    className={`cursor-pointer p-2 rounded border-2 transition-all ${
                      requestedCards.includes(userCard.cardId)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{userCard.card.name}</p>
                    <p className="text-xs text-gray-500">{userCard.card.rarity}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <textarea
                value={tradeMessage}
                onChange={(e) => setTradeMessage(e.target.value)}
                className="input"
                rows={3}
                placeholder="Add a message to your trade offer..."
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Send Trade Offer
            </button>
          </form>
        </div>
      )}

      {pendingTrades.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Pending Trades</h2>
          <div className="space-y-4">
            {pendingTrades.map((trade) => (
              <div key={trade.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {trade.initiator?.username} → {trade.receiver?.username}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Offering {trade.offeredCardIds.length} card(s) for{' '}
                      {trade.requestedCardIds.length} card(s)
                    </p>
                    {trade.message && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        "{trade.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleAccept(trade.id)}
                      className="btn btn-primary text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(trade.id)}
                      className="btn btn-secondary text-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleCancel(trade.id)}
                      className="btn btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedTrades.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Trade History</h2>
          <div className="space-y-2">
            {completedTrades.map((trade) => (
              <div key={trade.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {trade.initiator?.username} → {trade.receiver?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : trade.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {trade.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trades.length === 0 && !showCreateTrade && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No trades yet</p>
          <p className="mt-2">Click "Create Trade" to start trading!</p>
        </div>
      )}
    </div>
  );
}
