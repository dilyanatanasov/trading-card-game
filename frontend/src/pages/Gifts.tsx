import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { giftsAPI, usersAPI, cardsAPI } from '../services/api';
import type { Gift, User, UserCard } from '../types';

export default function Gifts() {
  const [receivedGifts, setReceivedGifts] = useState<Gift[]>([]);
  const [sentGifts, setSentGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'send'>('received');
  const [users, setUsers] = useState<User[]>([]);
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      const [receivedRes, sentRes, usersRes, cardsRes] = await Promise.all([
        giftsAPI.getReceived(),
        giftsAPI.getSent(),
        usersAPI.getAll(),
        cardsAPI.getMyCollection(),
      ]);
      setReceivedGifts(receivedRes.data);
      setSentGifts(sentRes.data);
      setUsers(usersRes.data);
      setMyCards(cardsRes.data);
    } catch (error) {
      toast.error('Failed to load gifts');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id: string) => {
    try {
      await giftsAPI.claim(id);
      toast.success('Gift claimed!');
      loadGifts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to claim gift');
    }
  };

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedCard) {
      toast.error('Please select a user and a card');
      return;
    }

    try {
      await giftsAPI.send({
        receiverId: selectedUser,
        cardId: selectedCard,
        message: giftMessage,
      });
      toast.success('Gift sent!');
      setSelectedUser('');
      setSelectedCard('');
      setGiftMessage('');
      setActiveTab('sent');
      loadGifts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send gift');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const gifts = activeTab === 'received' ? receivedGifts : sentGifts;
  const myUserId = users.find(u => u.email)?.id; // Get current user
  const otherUsers = users.filter(u => u.id !== myUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gifts</h1>
        <p className="mt-2 text-gray-600">Send and receive card gifts</p>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'received'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received ({receivedGifts.filter((g) => !g.claimed).length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'sent'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent ({sentGifts.length})
        </button>
        <button
          onClick={() => setActiveTab('send')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'send'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Send Gift
        </button>
      </div>

      {activeTab === 'send' ? (
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Send a Gift</h2>
          <form onSubmit={handleSendGift} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Recipient</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
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
              <label className="block text-sm font-medium mb-2">Select Card to Gift</label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="input"
                required
              >
                <option value="">Choose a card...</option>
                {myCards.map((userCard) => (
                  <option key={userCard.id} value={userCard.cardId}>
                    {userCard.card.name} (x{userCard.quantity}) - {userCard.card.rarity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                className="input"
                rows={3}
                placeholder="Add a personal message..."
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Send Gift
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {gifts.map((gift) => (
          <div key={gift.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">
                  {activeTab === 'received'
                    ? `From ${gift.sender?.username}`
                    : `To ${gift.receiver?.username}`}
                </p>
                {gift.message && (
                  <p className="text-sm text-gray-600 mt-1 italic">
                    "{gift.message}"
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(gift.createdAt).toLocaleDateString()}
                </p>
                {gift.claimed && gift.claimedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Claimed on {new Date(gift.claimedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {activeTab === 'received' && !gift.claimed && (
                <button
                  onClick={() => handleClaim(gift.id)}
                  className="btn btn-primary ml-4"
                >
                  Claim
                </button>
              )}
              {gift.claimed && (
                <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Claimed
                </span>
              )}
            </div>
          </div>
        ))}
          {gifts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">
                {activeTab === 'received' ? 'No gifts received' : 'No gifts sent'}
              </p>
              <p className="mt-2">
                {activeTab === 'received'
                  ? 'Your friends can send you cards as gifts!'
                  : 'Share your cards with friends!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
