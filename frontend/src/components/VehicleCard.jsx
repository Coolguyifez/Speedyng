import React from 'react';
import { MapPin, Gauge, CheckCircle } from 'lucide-react';

const VehicleCard = ({ vehicle }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative h-48">
        <img 
          src={vehicle.image} 
          alt={vehicle.name} 
          className="w-full h-full object-cover"
        />
        {vehicle.verified && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 truncate">{vehicle.name}</h3>
        <div className="flex items-center text-gray-500 text-sm mt-2">
          <MapPin className="w-3 h-3 mr-1" />
          {vehicle.location}
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-red-600 font-bold">₦{Number(vehicle.price).toLocaleString()}</span>
          <div className="flex items-center text-xs text-gray-400">
            <Gauge className="w-3 h-3 mr-1" />
            {vehicle.mileage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
