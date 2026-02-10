import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Phone, MapPin, Clock, Gauge, Fuel, Settings, 
  CheckCircle, Heart, Share2, Calendar, Loader2, ArrowLeft, Car, Palette, CircleGauge
} from 'lucide-react';
import { FaPhoneAlt } from "react-icons/fa"
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { vehicleAPI } from '../services/api'; // Integrated with your backend
import { toast } from 'sonner';

const CarDetailsPage = () => {
  const { id } = useParams();
  const [v, setVehicle] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch real vehicle data from backend
  useEffect(() => {
  const fetchVehicle = async () => {
    try {
      setIsLoading(true); 
      const response = await vehicleAPI.getOne(id);
      setVehicle(response.data);
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      toast.error("Could not load vehicle details");
    } finally {
      setIsLoading(false); 
    }
  };
  fetchVehicle();
}, [id]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

    

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
          <p className="text-gray-500 animate-pulse font-medium">Loading vehicle details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // 2. Not Found State
  if (!v) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-red-600 font-bold">!</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Vehicle Not Found</h2>
            <p className="text-gray-600 mb-8">
              The vehicle you're looking for might have been sold or removed. 
              Check out our other available Vehicles!
            </p>
            <Link to="/vehicles">
              <Button className="bg-red-600 hover:bg-red-700 px-8 py-6 text-lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Browse Available Vehicles
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <Link to="/vehicles" className="hover:text-red-600">Vehicles</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{v.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={v.images[selectedImage]}
                  alt={v.name}
                  className="w-full h-full object-cover"
                />
                {v.verified && (
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {v.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {v.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index ? 'border-red-600 shadow-lg' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${v.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Vehicle Details */}
            <Card className="mt-6 border-none shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Description</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{v.description}</p>

                <h3 className="text-xl font-bold mb-4 text-gray-900">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {v.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="border-none shadow-lg sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{v.name}</h1>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFavorite}
                      className={`hover:bg-red-50 ${
                        isFavorite ? 'text-red-600' : 'text-gray-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-600' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="text-gray-600 hover:bg-gray-100"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-4xl font-black text-gray-900 mb-3">
                    ₦{Number(v.price).toLocaleString()}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[v.condition, v.type, v.service].map((badge, idx) => (
                      <span key={idx} className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-100">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  {[
                    { icon: Car, label: 'Category', value: v.category },
                    { icon: Palette , label: 'Exterior Color', value: v.color },
                    { icon: Calendar, label: 'Year', value: v.year },
                    { icon: Gauge, label: 'Mileage', value: v.mileage },
                    { icon: CircleGauge, label: 'Acceleration(Acceleration (0-100 km/h)', value: v.acceleration ? `${v.acceleration}s` : 'N/A' },
                    { icon: Settings, label: 'Transmission', value: v.transmission },
                    { icon: Fuel, label: 'Fuel Type', value: v.fuel_type },
                    { icon: MapPin, label: 'Location', value: v.location },
                  ].map((spec, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <spec.icon className="w-5 h-5" />
                        <span>{spec.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
                
                {/* CTA Buttons */}
                <div className="space-y-3">
                  <a href="tel:08135877104" className="block">
                    <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:shadow-lg">
                    <FaPhoneAlt  className="w-4 h-4 mr-1" />
                      Call Agent
                    </Button>
                  </a>
                  <a 
                    href="https://forms.gle/e9ERKFpi3AZA5biG7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                    <Clock className="w-4 h-4 mr-1"/>
                    Book Inspection
                    </Button>
                  </a>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Need help? Chat with our AI assistant</p>
                  <p className="text-sm text-gray-500">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Suite 13, Goodluck Shopping Centre, adjacent to the Old Effurn Garden park, Effurun/Sapele Rd.Warri, Nigeria
                  </p>
                  <p className="text-sm text-gray-500">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Km8, Edebiri Complex Obayuwana Str.,
                    Lagos Rd. Ugbowo-Benin, Nigeria
                  </p>
                  
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default CarDetailsPage;
