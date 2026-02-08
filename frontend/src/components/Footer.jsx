import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin} from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { PiWhatsappLogo } from "react-icons/pi";
import { PiTiktokLogo } from "react-icons/pi";
import { TbBrandLinkedin } from "react-icons/tb";
const Footer = () => {
  const footerCategories = [
    "Subcompact Sedan", "Compact Sedan", "Mid-size Sedan", "Full-Size Sedan", "Luxury Sedan",
    "Sport Sedan", "Subcompact SUV", "Compact SUV", "Mid-size SUV", "Full-size SUV",
    "Coupe SUV", "CUV", "Luxury SUV", "Sport Compact","Hatchback", "Exotic", "Box Truck", "Dump Truck", "Flatbed Truck", "Tanker Truck", 
    "Refrigerator Truck", "Tow Truck", "Trailer Head", "Single Cabin Pickup", "Double Cabin Pickup", "Compact Pickup", "Full-Size Pickup", "Heavy-Duty Pickup (Dually)", 
    "Off-Road Pickup", "Mini-Bus", "Coaster Bus", "School Bus", "Luxury Coach", "Cargo Van", "Passenger Van", "Minivan",
    "Panel Van", "Sport Bike", "Cruiser", "Touring Bike", "Standard Motorcycle", "Passenger Keke", "Cargo Tricycle", "Delivery Tricycle",
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">Speedy</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Fast, reliable, and customer-focused Automotive marketplace in Nigeria. Your trusted broker for quality vehicles.
            </p>
            <div className="flex space-x-4">
              <a href="https://web.facebook.com/speedyng/" className="text-gray-400 hover:text-red-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
               <a href="https://wa.me/2348135877104" className="text-gray-400 hover:text-red-500 transition-colors">
                < PiWhatsappLogo className="w-5 h-5" />
              </a>
              <a href="https://x.com/speedyngcom" className="text-gray-400 hover:text-red-500 transition-colors">
                <FaXTwitter className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/speedyng/" className="text-gray-400 hover:text-red-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@speedyng" className="text-gray-400 hover:text-red-500 transition-colors">
                <PiTiktokLogo className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/speedy-ng-2b2ba11a1/" className="text-gray-400 hover:text-red-500 transition-colors">
                <TbBrandLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/vehicles" className="text-sm hover:text-red-500 transition-colors">
                  Browse Vehicles
                </Link>
              </li>
              <li>
                <Link to="/vehicles?type=Car" className="text-sm hover:text-red-500 transition-colors">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link to="/vehicles?type=Truck" className="text-sm hover:text-red-500 transition-colors">
                  Browse Trucks
                </Link>
              </li>
              <li>
                <Link to="/vehicles?type=Van" className="text-sm hover:text-red-500 transition-colors">
                  Browse Vans
                </Link>
              </li>
              <li>
                <Link to="/vehicles?type=Bus" className="text-sm hover:text-red-500 transition-colors">
                  Browse Buses
                </Link>
              </li>
              <li>
                <Link to="/vehicles?type=Motorcycle" className="text-sm hover:text-red-500 transition-colors">
                  Browse Motorcycles
                </Link>
              </li>
              <li>
                <Link to="/vehicles?type=Tricycle" className="text-sm hover:text-red-500 transition-colors">
                  Browse Tricycles (Keke)
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm hover:text-red-500 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-red-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm hover:text-red-500 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerCategories.map((cat) => (
                <li key={cat}>
                  <Link 
                    to={`/vehicles?category=${encodeURIComponent(cat)}`} 
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors duration-200 block w-full"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>
                  Suite 13, Goodluck Shopping Centre, adjacent to the Old Effurn Garden park, Effurun/Sapele Rd. Warri, Nigeria
                </span>
                
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>
                  Km8, Edebiri Complex Obayuwana Str., Lagos Rd. Ugbowo-Benin, Nigeria
                </span>
                
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href="tel:08135877104" className="hover:text-red-500 transition-colors">
                  08135877104
                </a>
                <p className= "text-red-500">or</p>
                <a href="tel:07056117175" className="hover:text-red-500 transition-colors">
                  07056117175
                </a>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href="mailto:infospeedyng360@gmail.com" className="hover:text-red-500 transition-colors">
                  infospeedyng360@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Speedy Auto Broker Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
