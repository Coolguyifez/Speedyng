import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Clock, Star, Car, Truck, Crown, Van, Bus,  DollarSign, Ship, TruckElectric } from 'lucide-react';
import { FaPhoneAlt } from "react-icons/fa";
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { categories, testimonials } from '../mock';
import { carAPI } from '../services/api';

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real cars from the database
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await carAPI.getAll();
        setCars(response.data);
      } catch (err) {
        console.error("Error fetching cars for homepage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const getCategoryIcon = (iconName) => {
    const icons = {
      Car: Car,
      Truck: Truck,
      Crown: Crown,
      DollarSign: DollarSign,
      Ship: Ship,
      Bus: Bus,
      TruckElectric: TruckElectric,
      Van: Van,
    };
    const Icon = typeof iconName === 'function' ? iconName : (icons[iconName] || Car);
    return <Icon className="w-8 h-8" />;
  };
  // Only show the first 6 cars on the homepage
  const featuredCars = cars.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img
            src="https://globemotors.ng/wp-content/uploads/2023/12/2024_mercedes-benz_gle-class_4dr-suv_amg-gle-53_fq_oem_1_1280x855-1024x684.webp"
            alt="Luxury showroom"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Find Your Perfect Car
            <span className="block text-red-500 mt-2">Drive with Confidence</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            Fast, reliable, and trustworthy car broker platform connecting buyers and dealers across Nigeria
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link to="/cars">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                Browse Cars
                <ArrowRight className="ml-1 w-5 h-5" />
              </Button>
            </Link>
            <a href="tel:09019254080">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                <FaPhoneAlt className="mr-1 w-5 h-5"/>
                Call us 
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Speedy */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Why Choose Speedy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Verified Cars</h3>
                <p className="text-gray-600">All vehicles carefully inspected and verified</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Fast Delivery</h3>
                <p className="text-gray-600">Quick processing with reliable delivery across the country</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Best Prices</h3>
                <p className="text-gray-600">Competitive pricing with premium service included</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">AI Assistance</h3>
                <p className="text-gray-600">Smart recommendations powered by AI</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              // CALCULATE LIVE COUNT:
              // This filters the cars already fetched from your database
              const actualCount = cars.filter(car => car.category === category.name).length;
      
              return (
                <Link key={index} to="/cars">
                  <Card className="border-2 border-gray-200 hover:border-red-500 transition-all duration-300 hover:shadow-lg cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-100 transition-colors duration-300">
                        <div className="text-gray-700 group-hover:text-red-600 transition-colors duration-300">
                          {getCategoryIcon(category.icon)}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                      {/* Displaying the real number from your database */}
                      <p className="text-sm text-gray-500">{actualCount} cars</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Featured Cars</h2>
            <Link to="/cars">
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <Link key={car.id} to={`/car/${car.id}`}>
                <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <div className="relative h-48 overflow-hidden bg-gray-200">
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
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-red-600 transition-colors">
                      {car.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-red-600">
                        ₦{(car.price / 1000000).toFixed(1)}M
                      </span>
                      <span className="text-sm text-gray-500">{car.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
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
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">What Our Customers Say</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-xl">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-lg italic mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].comment}"
                </p>
                <div className="flex justify-center space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTestimonial ? 'bg-red-600 w-8' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Find Your Dream Car?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our extensive collection or chat with our AI assistant for personalized recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cars">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                Browse All Cars
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default HomePage;
