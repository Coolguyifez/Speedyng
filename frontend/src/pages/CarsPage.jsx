import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';


const CarsPage = () => {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await carAPI.getAll();
        setCars(response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, []);
  

 const filteredCars = cars.filter((car) => {
    const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || car.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All Locations' || car.location === selectedLocation;
    const matchesCondition = selectedCondition === 'All Conditions' || car.condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesLocation && matchesCondition;
  });
    
    let matchesPrice = true;
    if (priceRange === 'under10') matchesPrice = car.price < 10000000;
    else if (priceRange === '10to20') matchesPrice = car.price >= 10000000 && car.price < 20000000;
    else if (priceRange === '20to40') matchesPrice = car.price >= 20000000 && car.price < 40000000;
    else if (priceRange === 'over40') matchesPrice = car.price >= 40000000;

    return matchesSearch && matchesCategory && matchesLocation && matchesCondition && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Our Cars</h1>
          <p className="text-xl text-gray-300">Find your perfect vehicle from our extensive collection</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-red-500">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat, index) => (
                  <SelectItem key={index} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-red-500">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location, index) => (
                  <SelectItem key={index} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Condition Filter */}
            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-red-500">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((condition, index) => (
                  <SelectItem key={index} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-red-500">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under10">Under ₦10M</SelectItem>
                <SelectItem value="10to20">₦10M - ₦20M</SelectItem>
                <SelectItem value="20to40">₦20M - ₦40M</SelectItem>
                <SelectItem value="over40">Over ₦40M</SelectItem>
              </SelectContent>
            </Select>
          </div>
          

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredCars.length}</span> cars
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLocation('All Locations');
                setSelectedCondition('All Conditions');
                setPriceRange('all');
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Cars Grid */}
     <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading inventory...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <Link key={car.id} to={`/car/${car.id}`}>
                <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <div className="relative h-52 overflow-hidden bg-gray-200">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {car.verified && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-900">Verified</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {car.condition}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">{car.category}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-red-600 transition-colors">
                      {car.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-red-600">
                        ₦{(car.price / 1000000).toFixed(1)}M
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        {car.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
                      <span>{car.year}</span>
                      <span>•</span>
                      <span>{car.transmission}</span>
                      <span>•</span>
                      <span>{car.mileage}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default CarsPage;
