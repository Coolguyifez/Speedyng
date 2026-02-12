import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, User, LogOut, ChevronDown } from 'lucide-react';
import { FiUserCheck } from "react-icons/fi";
import { Button } from './ui/button';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const vehicleTypes = [
    { name: 'Cars', slug: 'Car' },
    { name: 'Trucks', slug: 'Truck' },
    { name: 'Vans', slug: 'Van' },
    { name: 'Buses', slug: 'Bus' },
    { name: 'Motorcycles', slug: 'Motorcycle' },
    { name: 'Tricycles', slug: 'Tricycle' },
  ];

  useEffect(() => {
    const fetchUser = () => {
      try {
        // Safe check to ensure authAPI exists before calling getUser
        if (authAPI && typeof authAPI.getUser === 'function') {
          const currentUser = authAPI.getUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Failed to fetch user in Header:", error);
      }
    };

    fetchUser();
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is not on the dropdown button, close it
      if (!event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
  
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);


  const isActive = (path) => location.pathname === path;

  // Checks if the current URL matches the vehicle type query
  const isTypeActive = (slug) => {
    const params = new URLSearchParams(location.search);
    return params.get('type') === slug;
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-black ml-2">Speedy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center ml-12 space-x-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors hover:text-red-600 ${
                isActive('/') ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              Home
            </Link>

            <div 
              className="relative dropdown-container py-4"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center space-x-1 text-sm font-semibold transition-colors hover:text-red-600 ${
                  location.pathname === '/vehicles' ? 'text-red-600' : 'text-gray-700'
                }`}
              >
                <span>Vehicle Types</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 transition-all duration-200 z-50 ${dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                {vehicleTypes.map((type) => (
                  <Link
                    key={type.slug}
                    to={`/vehicles?type=${type.slug}`}
                    className={`block px-4 py-2 text-sm transition-colors hover:bg-red-50 hover:text-red-600 ${
                      isTypeActive(type.slug) ? 'text-red-600 bg-red-50 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {type.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-red-600 ${
                isActive('/contact') ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center ml-auto space-x-6">
            <div className="flex items-center space-x-6">
              <a href="tel:08135877104" className="flex items-center text-gray-700 hover:text-red-600 transition-colors">
                <Phone className="w-4 h-4 mr-1" />
                <span className="text-xs font-bold">08135877104</span>
              </a>
              <a href="tel:07056117175" className="flex items-center text-gray-700 hover:text-red-600 transition-colors">
                <Phone className="w-4 h-4 mr-1" />
                <span className="text-xs font-bold">07056117175</span>
              </a>
            </div>
            
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <span className="text-sm font-medium text-gray-600">Hello, {user.name}</span>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-red-600 hover:bg-red-50">
                      <FiUserCheck className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300">
                      <User className="w-4 h-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden ml-auto p-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top px-4">
            <nav className="flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-2 text-base font-medium rounded-md transition-colors hover:text-red-600 ${
                  isActive('/') ? 'text-red-600 bg-red-50' : 'text-gray-700'
                }`}
              >
                Home
              </Link>
                
              {vehicleTypes.map((type) => (
                <Link
                  key={type.slug}
                  to={`/vehicles?type=${type.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-2 text-base font-medium rounded-md transition-colors hover:text-red-600 ${
                    isTypeActive(type.slug) ? 'text-red-600 bg-red-50 font-bold' : 'text-gray-700'
                  }`}
                >
                  {type.name}
                </Link>
              ))}
  
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-2 text-base font-medium rounded-md transition-colors hover:text-red-600 ${
                  isActive('/contact') ? 'text-red-600 bg-red-50' : 'text-gray-700'
                }`}
              >
                Contact
              </Link>

              <div className="pt-4 space-y-4 px-2 border-t border-gray-50 mt-2">
                <div className="flex flex-col space-y-3">
                   <a href="tel:08135877104" className="flex items-center text-sm font-semibold text-gray-600">
                     <Phone className="w-4 h-4 mr-2" /> 
                     08135877104
                   </a>
                   <a href="tel:07056117175" className="flex items-center text-sm font-semibold text-gray-600">
                     <Phone className="w-4 h-4 mr-2" /> 
                     07056117175
                   </a>
                </div>
              
                {user ? (
                  <div className="space-y-3">
                    <span className="text-sm text-gray-600 block">Hello, {user.name}</span>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <FiUserCheck className="w-4 h-4 mr-1" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
                        <User className="w-4 h-4 mr-1" />
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
