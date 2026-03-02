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
      toast.success('Login successful! Welcome back to Speedy.');
      
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
   <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-white">
      
      {/* LEFT SIDE: Brand Image & Marketing (Visible only on Laptop/Large Screens) */}
      <div className="hidden lg:flex relative bg-black items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920" 
          alt="Luxury Car" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </Link>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            The ultimate platform for auto agents.
          </h2>
          <p className="text-gray-300 text-lg">
            Manage your deals, connect with clients, and accelerate your business on Speedy.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form (Fits 100% on Mobile) */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-gray-50/50">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
          
          {/* Logo for Mobile only */}
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </Link>
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors w-5 h-5" />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-sm font-bold text-red-600 hover:text-red-700">
                Forgot password?
              </Link>
            </div>

            <Button disabled={isLoading} type="submit" className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-red-200 transition-all active:scale-95">
              {isLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-400">
              <span className="px-4 bg-white">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700">
              <FaGoogle className="text-red-500 mr-2" />
            </button>
            <button onClick={() => handleSocialLogin('Facebook')} className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700">
              <FaFacebook className="text-blue-600 mr-2" />
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? <Link to="/register" state={{ from: location.state?.from }} className="text-red-600 font-bold hover:underline">Sign up</Link>
            </p>
          </div>
          <div className="mt-6">
            <Link to="/">
              <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-800 transition-colors">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
