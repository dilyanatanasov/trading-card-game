import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { cardsAPI, giftsAPI, tradesAPI } from '../services/api';
import type { UserCard, Gift, Trade } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentCards, setRecentCards] = useState<UserCard[]>([]);
  const [pendingGifts, setPendingGifts] = useState<Gift[]>([]);
  const [pendingTrades, setPendingTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [cardsRes, giftsRes, tradesRes] = await Promise.all([
        cardsAPI.getMyCollection(),
        giftsAPI.getReceived(),
        tradesAPI.getAll(),
      ]);

      setRecentCards(cardsRes.data.slice(0, 6));
      setPendingGifts(giftsRes.data.filter((g) => !g.claimed));
      setPendingTrades(
        tradesRes.data.filter(
          (t) => t.status === 'pending' && t.receiverId === user?.id
        )
      );
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your card collection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <h3 className="text-lg font-semibold">Total Cards</h3>
          <p className="text-4xl font-bold mt-2">
            {recentCards.reduce((sum, uc) => sum + uc.quantity, 0)}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <h3 className="text-lg font-semibold">Coins</h3>
          <p className="text-4xl font-bold mt-2">{user?.coins}</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-semibold">Pending Actions</h3>
          <p className="text-4xl font-bold mt-2">
            {pendingGifts.length + pendingTrades.length}
          </p>
        </div>
      </div>

      {pendingGifts.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pending Gifts</h2>
            <Link to="/gifts" className="text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {pendingGifts.map((gift) => (
              <div
                key={gift.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">Gift from {gift.sender?.username}</p>
                  {gift.message && (
                    <p className="text-sm text-gray-600">{gift.message}</p>
                  )}
                </div>
                <Link
                  to="/gifts"
                  className="btn btn-primary text-sm"
                >
                  Claim
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingTrades.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pending Trades</h2>
            <Link to="/trading" className="text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {pendingTrades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    Trade from {trade.initiator?.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    Offering {trade.offeredCardIds.length} card(s) for{' '}
                    {trade.requestedCardIds.length} card(s)
                  </p>
                </div>
                <Link
                  to="/trading"
                  className="btn btn-primary text-sm"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Cards</h2>
          <Link
            to="/collection"
            className="text-primary-600 hover:text-primary-700"
          >
            View collection
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentCards.map((userCard) => (
            <div key={userCard.id} className="text-center">
              <img
                src={userCard.card.imageUrl}
                alt={userCard.card.name}
                className="w-full h-40 object-cover rounded-lg"
              />
              <p className="mt-2 text-sm font-medium truncate">
                {userCard.card.name}
              </p>
              <p className="text-xs text-gray-500">x{userCard.quantity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
