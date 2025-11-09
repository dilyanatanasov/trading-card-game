import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { marketplaceAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { MarketplaceListing } from '../types';

export default function Marketplace() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const response = await marketplaceAPI.getAll();
      setListings(response.data);
    } catch (error) {
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (id: string) => {
    try {
      await marketplaceAPI.buy(id);
      toast.success('Card purchased!');

      // Refresh user data to update coin balance
      if (user) {
        const updatedUser = await usersAPI.getProfile();
        updateUser(updatedUser.data);
      }

      loadListings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to buy card');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Marketplace</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Buy cards from other players</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="card hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sold by</p>
                  <p className="font-medium dark:text-gray-100">{listing.seller?.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                    {listing.price}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500">
                Listed {new Date(listing.createdAt).toLocaleDateString()}
              </p>

              <button
                onClick={() => handleBuy(listing.id)}
                className="btn btn-primary w-full"
              >
                Buy Card
              </button>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-xl font-fantasy">No listings available</p>
          <p className="mt-2">Check back later for new cards!</p>
        </div>
      )}
    </div>
  );
}
