import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { PiWhatsappLogo, PiTiktokLogo } from "react-icons/pi";
import { TbBrandLinkedin } from "react-icons/tb";

const Footer = () => {
  const footerCategories = [
    "Sedan", "SUV", "Hatchback", "Exotic", "Box Truck", 
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
          <div className="space-y-6">
            <h2 className="text-white font-bold mb-6 text-lg tracking-tight">Speedy</h2>
           
            <p className="text-sm text-gray-400 leading-relaxed">
              Fast, reliable, and customer-focused Automotive marketplace in Nigeria. Your trusted broker for quality vehicles.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://web.facebook.com/profile.php?id=61587492129988" className="hover:text-red-500 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="https://wa.me/2348135877104" className="hover:text-red-500 transition-colors"><PiWhatsappLogo className="w-5 h-5" /></a>
              <a href="https://x.com/speedyngcom" className="hover:text-red-500 transition-colors"><FaXTwitter className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/_speedyng/" className="hover:text-red-500 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.tiktok.com/@speedyng" className="hover:text-red-500 transition-colors"><PiTiktokLogo className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/in/speedy-ng-2b2ba11a1/" className="hover:text-red-500 transition-colors"><TbBrandLinkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg tracking-tight">Platforms</h3>
            <ul className="grid grid-cols-1 gap-3">
              {[
                { label: 'Our Inventory', to: '/vehicles' },
                { label: 'What we Do', to: '/about' },
                { label: 'We Available for Listing', to: '/sell' },
                { label: 'Help Center', to: '/contact' },
                { label: 'Our Privacy Policy', to: '/privacy' },
                { label: 'Our Terms of Services', to: '/terms' }
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
            <h3 className="text-white font-bold mb-6 text-lg tracking-tight">Categories</h3>
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2.5"
              style={{
                msOverflowStyle: 'none',  /* Internet Explorer and Edge */
                scrollbarWidth: 'none',   /* Firefox */
                WebkitScrollbar: { display: 'none' } /* Chrome, Safari and Opera */
              }}
            >
              {footerCategories.map((cat) => (
                <Link 
                  key={cat}
                  to={`/vehicles?category=${encodeURIComponent(cat)}`}
                  className="text-sm hover:text-red-500 hover:translate-x-1 transition-all duration-200 block hover:text-red-500 pl-0 hover:pl-3"
                >
                  {cat}s
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg tracking-tight">Our Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-gray-400">Warri & Benin City, Nigeria</span>
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
                  Email Support
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
