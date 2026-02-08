import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { PiWhatsappLogo, PiTiktokLogo } from "react-icons/pi";
import { TbBrandLinkedin } from "react-icons/tb";

const Footer = () => {
  const footerCategories = [
    "Subcompact Sedan", "Compact Sedan", "Mid-size Sedan", "Full-Size Sedan", "Luxury Sedan",
    "Sport Sedan", "Subcompact SUV", "Compact SUV", "Mid-size SUV", "Full-size SUV",
    "Coupe SUV", "CUV", "Luxury SUV", "Sport Compact", "Hatchback", "Exotic", "Box Truck", 
    "Dump Truck", "Flatbed Truck", "Tanker Truck", "Refrigerator Truck", "Tow Truck", 
    "Trailer Head", "Single Cabin Pickup", "Double Cabin Pickup", "Compact Pickup", 
    "Full-Size Pickup", "Heavy-Duty Pickup (Dually)", "Off-Road Pickup", "Mini-Bus", 
    "Coaster Bus", "School Bus", "Luxury Coach", "Cargo Van", "Passenger Van", "Minivan",
    "Panel Van", "Sport Bike", "Cruiser", "Touring Bike", "Standard Motorcycle", 
    "Passenger Keke", "Cargo Tricycle", "Delivery Tricycle",
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center transform rotate-3">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-white">Speedy</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Fast, reliable, and customer-focused Automotive marketplace in Nigeria. Your trusted broker for quality vehicles.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://web.facebook.com/speedyng/" className="hover:text-red-500 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="https://wa.me/2348135877104" className="hover:text-red-500 transition-colors"><PiWhatsappLogo className="w-5 h-5" /></a>
              <a href="https://x.com/speedyngcom" className="hover:text-red-500 transition-colors"><FaXTwitter className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/speedyng/" className="hover:text-red-500 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.tiktok.com/@speedyng" className="hover:text-red-500 transition-colors"><PiTiktokLogo className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/in/speedy-ng-2b2ba11a1/" className="hover:text-red-500 transition-colors"><TbBrandLinkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="grid grid-cols-1 gap-3">
              {[
                { label: 'Browse Vehicles', to: '/vehicles' },
                { label: 'Browse Cars', to: '/vehicles?type=Car' },
                { label: 'Browse Trucks', to: '/vehicles?type=Truck' },
                { label: 'Browse Vans', to: '/vehicles?type=Van' },
                { label: 'Browse Buses', to: '/vehicles?type=Bus' },
                { label: 'Browse Motocycles', to: '/vehicles?type=Motorcycle' },
                { label: 'Browse Tricycles', to: '/vehicles?type=Tricycle' },
                { label: 'Contact Us', to: '/contact' }
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-red-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories - Scrollable Section */}
          <div>
            <h3 className="text-white font-semibold mb-6">Categories</h3>
            <div className="max-h-60 overflow-y-auto pr-4 custom-scrollbar space-y-2">
              {footerCategories.map((cat) => (
                <Link 
                  key={cat}
                  to={`/vehicles?category=${encodeURIComponent(cat)}`}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors block py-1 border-b border-gray-800/50"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <span>Suite 13, Goodluck Shopping Centre, Effurun/Sapele Rd. Warri, Nigeria</span>
              </li>
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <span>Km8, Edebiri Complex, Lagos Rd. Ugbowo-Benin, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex gap-2">
                  <a href="tel:08135877104" className="hover:text-red-500">08135877104</a>
                  <span className="text-red-500">/</span>
                  <a href="tel:07056117175" className="hover:text-red-500">07056117175</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-red-500 shrink-0" />
                <a href="mailto:infospeedyng360@gmail.com" className="hover:text-red-500 truncate">
                  infospeedyng360@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Speedy Auto Broker Hub. All rights reserved.
          </p>
        </div>
      </div>

      {/* Basic CSS for the scrollbar directly in the file for simplicity */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 10px; }
      `}} />
    </footer>
  );
};

export default Footer;
