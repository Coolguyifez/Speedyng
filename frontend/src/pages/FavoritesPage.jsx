import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../services/api';
import Header from '../components/Header';
import VehicleCard from '../components/VehicleCard'; // Reuse your existing card!
import { Heart } from 'lucide-react';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await vehicleAPI.getFavorites(); // We'll add this to api.js next
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="text-red-600 fill-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Saved Vehicles</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />)}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} isFavoritePage={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">You haven't saved any vehicles yet.</p>
            <a href="/vehicles" className="text-red-600 font-semibold hover:underline">Browse Inventory</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
