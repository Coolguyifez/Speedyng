import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Clock, Star, Car, Truck, Crown, Bus, Info, DollarSign, Ship, TruckElectric, ShieldCheck, Zap } from 'lucide-react';
import { FaTruckPickup  } from "react-icons/fa";
import { FaMotorcycle } from "react-icons/fa";
import { TbCarSuv } from "react-icons/tb";
import { PiCarProfileLight } from "react-icons/pi";
import { MdOutlineCarRental } from "react-icons/md";
import { PiMotorcycleLight } from "react-icons/pi";
import { GiRaceCar } from "react-icons/gi";
import { PiVan } from "react-icons/pi";
import { FaPhoneAlt } from "react-icons/fa";
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { categories, testimonials } from '../mock';
import { vehicleAPI } from '../services/api';

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const formatPrice = (price) => {
    if (!price) return "0";
    const num = parseFloat(price);
    
    // Format for Millions (e.g., 12.5M)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    // Format for Thousands (e.g., 850K)
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    // Fallback for smaller amounts
    return num.toLocaleString();
  };

  // Fetch real cars from the database
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehicleAPI.getAll();
        setVehicles(response.data);
      } catch (err) {
        console.error("Error fetching cars for homepage:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);


  const slides = [
    
    {
      image: "https://i.imgur.com/gxcdCoo.png",
      title: "The Ultimate Vehicle Hub ",
      highlight: "Your Journey Starts Here",
      text: "Nigeria's most trusted brokerage for cars, trucks, and commercial fleets. We verify so you can drive."
    },
    {
      image: "https://globemotors.ng/wp-content/uploads/2023/12/2024_mercedes-benz_gle-class_4dr-suv_amg-gle-53_fq_oem_1_1280x855-1024x684.webp",
      title: "Premium Luxury Cars",
      highlight: "Drive with Confidence",
      text: "Premium brokerage connecting you to verified luxury and everyday cars from certified dealers across Nigeria."
    },
    {
      image: "https://plus.unsplash.com/premium_photo-1661963219843-f1a50a6cfcd3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "High Duty Trucks",
      highlight: "Power Your Business",
      text: "Reliable haulage and construction trucks inspected for maximum performance."
    },
    {
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1920",
      title: "Commercial & Luxury Buses",
      highlight: "Transporting the Future",
      text: "From city shuttles to interstate luxury coaches, we connect you with the most reliable bus dealers in Nigeria."
    },
    {
      image: "https://images.unsplash.com/photo-1724479839764-65981526641d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Versatile Delivery Vans",
      highlight: "Logistics Made Easy",
      text: "The best deals on cargo and passenger vans for your growing transport needs."
    },
    {
      image: "https://images.unsplash.com/photo-1508357941501-0924cf312bbd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Quality Motorcycles",
      highlight: "Swift & Reliable",
      text: "From sport bikes to commuter rides, find the two-wheeler that fits your lifestyle."
    },
    {
      image: "https://images.unsplash.com/photo-1728545032673-e70e1117fbba?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Passenger Tricycles",
      highlight: "City Mobility",
      text: "Durable and fuel-efficient tricycles (Keke) for smart urban transportation."
    }
  ];

  // Auto-play Carousel Logic
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // Changes every 5 seconds
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  const getCategoryIcon = (iconName) => {
    const icons = {
      Car: Car,
      Truck: Truck,
      Crown: Crown,
      DollarSign: DollarSign,
      Ship: Ship,
      Bus: Bus,
      TruckElectric: TruckElectric,
      FaTruckPickup: FaTruckPickup,
      FaMotorcycle: FaMotorcycle,
      TbCarSuv: TbCarSuv,
      Zap: Zap,
      PiCarProfileLight: PiCarProfileLight,
      PiMotorcycleLight: PiMotorcycleLight,
      PiVan: PiVan,
      MdOutlineCarRental: MdOutlineCarRental,
      GiRaceCar: GiRaceCar,
    };
    const Icon = typeof iconName === 'function' ? iconName : (icons[iconName] || Car);
    return <Icon className="w-8 h-8" />;
  };
  // This ensures the homepage stays clean while still giving access to everything
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 6);
  // Only show the first 6 cars on the homepage
  const featuredVehicles = vehicles.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-black">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-50" : "opacity-0"
            }`}
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {slides[currentSlide].title}
            <span className="block text-red-500 mt-2">{slides[currentSlide].highlight}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            {slides[currentSlide].text}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link to="/about">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                <Info className="mr-1 w-5 h-5"/>
                About Us
              </Button>
            </Link>
            <a href="tel:08135877104">
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
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Verified Vehicles</h3>
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
                  <ShieldCheck className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Verified Vehicle Dealers</h3>
                <p className="text-gray-600">Connecting you to only the verified vehicle dealers</p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 transition-all duration-500">
            {displayedCategories.map((category, index) => {
              // CALCULATE LIVE COUNT:
              // This filters the vehicles already fetched from your database
              const actualCount = vehicles.filter(v => v.category === category.name).length;
      
              return (
                <Link key={index} to={`/vehicles?category=${encodeURIComponent(category.name)}`}
                  className="animate-in fade-in zoom-in duration-300"
                >
                  <Card className="border-2 border-gray-200 hover:border-red-500 transition-all duration-300 hover:shadow-lg cursor-pointer group h-full">
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors duration-300">
                        <div className="text-gray-700 group-hover:text-red-600 transition-colors duration-300 scale-90">
                          {getCategoryIcon(category.icon)}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{category.name}s</h3>
                      {/* Displaying the real number from your database */}
                      <p className="text-sm text-gray-500">{actualCount} unit(s)</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          {/*VIEW ALL CATEGORY TOGGLE BUTTON */}
          <div className="mt-10 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="border-gray-200 text-gray-600 hover:border-red-600 hover:text-red-600 px-10 rounded-full transition-all"
            >
              {showAllCategories ? "Show Less" : `View All ${categories.length} Categories`}
            </Button>
          </div>
        </div>
      </section>
        
      {/* Featured Vehicles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Featured Vehicles</h2>
            <Link to="/vehicles">
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((v) => (
              <Link key={v.id} to={`/vehicles/${(v.name || 'vehicle').toLowerCase().replace(/\s+/g, '-')}/${v.id}`}>
                <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={v.image}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {v.verified && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-900">Verified</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm w-fit">
                        {v.service}
                      </div>
                      <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium w-fit">
                        {v.condition}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-2 text-xs font-medium uppercase">
                      <span className="text-gray-400">{v.type}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400">{v.color}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">{v.category}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-red-600 transition-colors">
                      {v.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-red-600">
                        ₦{formatPrice(v.price)}
                      </span>
                      <span className="text-sm text-gray-500">{v.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{v.year}</span>
                      <span>•</span>
                      <span>{v.transmission}</span>
                      <span>•</span>
                      <span>{v.mileage}</span>
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
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Find Your Dream Vehicle?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our extensive collection or chat with our AI assistant for personalized recommendations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/vehicles">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                Browse All Inventory
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
