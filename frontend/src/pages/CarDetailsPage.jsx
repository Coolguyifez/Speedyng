import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Gauge, Fuel, Settings, CheckCircle, Heart, Share2, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { cars } from '../mock';
import { toast } from 'sonner';

const CarDetailsPage = () => {
  const { id } = useParams();
  const car = cars.find((c) => c.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!car) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Car Not Found</h2>
          <Link to="/cars">
            <Button className="bg-red-600 hover:bg-red-700">Browse Cars</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleBookInspection = () => {
    toast.success('Inspection booking request sent! We\'ll call you shortly.');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <Link to="/cars" className="hover:text-red-600">Cars</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{car.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={car.images[selectedImage]}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
                {car.verified && (
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {car.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index ? 'border-red-600 shadow-lg' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${car.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Car Details */}
            <Card className="mt-6 border-none shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Description</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{car.description}</p>

                <h3 className="text-xl font-bold mb-4 text-gray-900">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
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
                  <h1 className="text-2xl font-bold text-gray-900">{car.name}</h1>
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

                <div className="mb-6">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    ₦{car.price.toLocaleString()}
                  </div>
                  <div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    {car.condition}
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span>Year</span>
                    </div>
                    <span className="font-semibold text-gray-900">{car.year}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Gauge className="w-5 h-5" />
                      <span>Mileage</span>
                    </div>
                    <span className="font-semibold text-gray-900">{car.mileage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Settings className="w-5 h-5" />
                      <span>Transmission</span>
                    </div>
                    <span className="font-semibold text-gray-900">{car.transmission}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Fuel className="w-5 h-5" />
                      <span>Fuel Type</span>
                    </div>
                    <span className="font-semibold text-gray-900">{car.fuelType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>Location</span>
                    </div>
                    <span className="font-semibold text-gray-900">{car.location}</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <a href="tel:08154675347" className="block">
                    <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:shadow-lg">
                      <Phone className="w-5 h-5 mr-2" />
                      Call Now
                    </Button>
                  </a>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleBookInspection}
                    className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Book Inspection
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Need help? Chat with our AI assistant</p>
                  <p className="text-sm text-gray-500">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    No. 18 Admiralty Way, Lekki Phase 1, Lagos
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