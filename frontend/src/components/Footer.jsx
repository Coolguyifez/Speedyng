import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin} from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { PiWhatsappLogo } from "react-icons/pi";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-white">Speedy</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Fast, reliable, and customer-focused car marketplace in Nigeria. Your trusted partner for quality vehicles.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
               <a href="https://wa.me/2348154675347" className="text-gray-400 hover:text-red-500 transition-colors">
                < PiWhatsappLogo className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <FaXTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              
               
              
             
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cars" className="text-sm hover:text-red-500 transition-colors">
                  Browse Cars
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
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">Sedans</li>
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">SUVs</li>
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">Luxury</li>
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">Trucks</li>
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">Pickup Trucks</li>
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">Hatchbacks</li>
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">Buses</li>
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">Convertibles</li>
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">MPV</li>
               <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">Vans</li>
              <li className="text-sm hover:text-red-500 transition-colors cursor-pointer">Budget Cars</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <h4>Warri</h4>
                <span>
                  Suite 13, Goodluck Shopping Centre, adjacent to the Old Effurn Garden park, Effurun/Sapele Rd. Warri, Nigeria
                </span>
                
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <h4>Benin</h4>
                <span>
                  Km8, Edebiri Complex Ugbowo, Lagos Rd. Benin, Nigeria
                </span>
                
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href="tel:09019254080" className="hover:text-red-500 transition-colors">
                  09019254080
                </a>
                <p className= "text-red-500">or</p>
                <a href="tel:07056117175" className="hover:text-red-500 transition-colors">
                  07056117175
                </a>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                <a href="infospeedyng360@gmail.com" className="hover:text-red-500 transition-colors">
                  infospeedyng360@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Speedy Auto Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
