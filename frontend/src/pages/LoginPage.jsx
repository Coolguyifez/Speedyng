import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
// IMPORT DIRECTLY TO PREVENT CRASH
import { authAPI } from '../services/api'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //Get the "from" path (where the user came from)
  // If they just clicked "Login" normally, this defaults to "/"
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSocialLogin = (provider) => {
    sessionStorage.setItem('redirectAfterLogin', from);
    console.log("Memory Saved:", from);
  
    const BACKEND_BASE = "https://speedy-backend-fb9s.onrender.com/api/auth";
    const redirectUri = `${BACKEND_BASE}/${provider.toLowerCase()}/callback`;
    
    const configs = {
      Google: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          client_id: "464436673090-rijnmt8gigm23pa6r9mc1mug1df0f0b1.apps.googleusercontent.com",
          redirect_uri: redirectUri,
          response_type: "code",
          scope: "email profile",
          prompt: "select_account"
        }
      },
      Facebook: {
        url: "https://www.facebook.com/v12.0/dialog/oauth",
        params: {
          client_id: "1150645627033722",
          redirect_uri: redirectUri,
          scope: "email,public_profile",
          response_type: "code"
        }
      }
    };

    const config = configs[provider];
    if (config) {
      toast.info(`Redirecting to ${provider}...`);
      const query = new URLSearchParams(config.params).toString();
      window.location.href = `${config.url}?${query}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Prevent double clicking
    try {
      // Logic for real login
      const data = await authAPI.login(formData);
      toast.success('Login successful!');
      
      // Check if admin or user to redirect correctly
      if (data.user && data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Your existing Return/JSX design code stays exactly the same)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardContent className="p-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-3xl font-bold text-black">Speedy</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            <Button
              disabled={isLoading}
              type="submit"
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:shadow-lg"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>
          
          {/* Social Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons Row */}
          <div className="grid grid-cols-2 gap-2 mb-8">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="flex justify-center items-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              
            >
              <FaGoogle className="w-5 h-5 text-[#DB4437]" />
            </button>
            <button
              onClick={() => handleSocialLogin('Facebook')}
              className="flex justify-center items-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            
            >
              <FaFacebook className="w-5 h-5 text-[#4267B2]" />
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                state={{ from: location.state?.from }} 
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <Link to="/">
              <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
