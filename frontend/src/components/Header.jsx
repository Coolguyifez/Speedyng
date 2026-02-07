import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
import { FiUserCheck } from "react-icons/fi";
import { Button } from './ui/button';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-black">Speedy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-red-600 ${
                isActive('/') ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/vehicles"
              className={`text-sm font-medium transition-colors hover:text-red-600 ${
                isActive('/vehicles') ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              Browse Vehicles
            </Link>
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
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:08135877104" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors">
              <Phone className="w-4 h-4 ml-1" />
              <span className="text-sm font-medium">08135877104</span>
            </a>
            <a href="tel:07056117175" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors">
              <Phone className="w-4 h-4 ml-1" />
              <span className="text-sm font-medium">07056117175</span>
            </a>
            
            
            {user ? (
              <>
                <span className="text-sm text-gray-600">Hello, {user.name}</span>
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
                    <FiUserCheck className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300">
                    <User className="w-4 h-4 mr-1" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-red-600 ${
                  isActive('/') ? 'text-red-600' : 'text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                to="/vehicles"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-red-600 ${
                  isActive('/vehicles') ? 'text-red-600' : 'text-gray-700'
                }`}
              >
                Browse Vehicles
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-red-600 ${
                  isActive('/contact') ? 'text-red-600' : 'text-gray-700'
                }`}
              >
                Contact
              </Link>
              <a href="tel:08135877104" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">08135877104</span>
              </a>
              <a href="tel:07056117175" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">07056117175</span>
              </a>
              
              {user ? (
                <>
                  <span className="text-sm text-gray-600">Hello, {user.name}</span>
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
                </>
              ) : (
                <>
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
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
