import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import { vehicleAPI } from '../services/api';
import Header from '../components/Header';
import VehicleCard from '../components/VehicleCard';
import { Heart, Loader2, ArrowRight } from 'lucide-react';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await vehicleAPI.getFavorites();
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
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Heart className="text-red-600 fill-red-600 w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Saved Vehicles</h1>
          </div>
          <span className="text-gray-500 font-medium">{favorites.length} Saved</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-gray-500">Retrieving your garage...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map(vehicle => (
              // 2. Wrap the card in a Link tag
              // We slugify the name for a cleaner URL
              <Link 
                key={vehicle.id} 
                to={`/vehicles/${vehicle.name.replace(/\s+/g, '-').toLowerCase()}/${vehicle.id}`}
                className="transition-transform duration-300 hover:-translate-y-2"
              >
                <VehicleCard vehicle={vehicle} isFavoritePage={true} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Heart className="text-gray-300 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your garage is empty</h2>
              <p className="text-gray-500 mb-8">Save vehicles you're interested in to compare them later or book inspections.</p>
              <Link to="/vehicles">
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center mx-auto group">
                  Browse Inventory
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
