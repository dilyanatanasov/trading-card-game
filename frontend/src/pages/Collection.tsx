import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cardsAPI, marketplaceAPI } from '../services/api';
import type { UserCard } from '../types';
import { getRarityStyles } from '../utils/rarity';

export default function Collection() {
  const [collection, setCollection] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellCardId, setSellCardId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState('');

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      const response = await cardsAPI.getMyCollection();
      setCollection(response.data);
    } catch (error) {
      toast.error('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (cardId: string) => {
    try {
      await cardsAPI.toggleFavorite(cardId);
      toast.success('Favorite updated');
      loadCollection();
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleSellCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellCardId || !sellPrice) return;

    try {
      await marketplaceAPI.create({
        cardId: sellCardId,
        price: parseInt(sellPrice),
      });
      toast.success('Card listed for sale!');
      setSellCardId(null);
      setSellPrice('');
      loadCollection();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to list card');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Collection</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          You have {collection.length} unique cards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {collection.map((userCard) => {
          const rarityStyles = getRarityStyles(userCard.card.rarity);
          return (
          <div key={userCard.id} className={`card ${rarityStyles.border} ${rarityStyles.glow} transition-all duration-300`}>
            <img
              src={userCard.card.imageUrl}
              alt={userCard.card.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg dark:text-gray-100">{userCard.card.name}</h3>
                <button
                  onClick={() => handleToggleFavorite(userCard.cardId)}
                  className="text-2xl text-yellow-500 hover:text-yellow-600 transition-all hover:scale-125"
                >
                  {userCard.isFavorite ? '★' : '☆'}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userCard.card.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${rarityStyles.badge}`}>
                  {userCard.card.rarity}
                </span>
                <span className="text-sm font-medium dark:text-gray-300">Qty: {userCard.quantity}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="text-yellow-500">⚜</span> Value: {userCard.card.baseValue} coins
              </p>
              <div className="flex gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1">
                  <span className="text-red-500">⚔️</span> ATK: {userCard.card.attack}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-blue-500">🛡️</span> DEF: {userCard.card.defense}
                </span>
              </div>
              {userCard.card.ability && (
                <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 rounded-lg">
                  <p className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <span>⚡</span> {userCard.card.ability.name}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {userCard.card.ability.description}
                  </p>
                </div>
              )}
              {sellCardId === userCard.cardId ? (
                <form onSubmit={handleSellCard} className="mt-3 space-y-2">
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    placeholder="Price in coins"
                    className="input text-sm"
                    min="1"
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary text-sm flex-1">
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellCardId(null)}
                      className="btn btn-secondary text-sm flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setSellCardId(userCard.cardId);
                    setSellPrice(userCard.card.baseValue.toString());
                  }}
                  className="btn btn-primary text-sm w-full mt-3"
                >
                  Sell Card
                </button>
              )}
            </div>
          </div>
        )})}
      </div>

      {collection.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-xl font-fantasy">No cards yet</p>
          <p className="mt-2">Your daily card will arrive soon!</p>
        </div>
      )}
    </div>
  );
}
