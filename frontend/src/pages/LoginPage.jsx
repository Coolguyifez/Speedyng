import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
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
    <div className="flex h-screen w-full font-sans bg-white overflow-hidden">
      
      {/* LEFT SIDE: Brand Image & Marketing */}
      <div className="hidden lg:block lg:w-1/2 relative bg-black">
        <img 
          src="https://images.unsplash.com/photo-1648585445027-3da07a7588a0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Luxury Car" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 hover:scale-105"
        />
        <div className="relative z-10 flex flex-col justify-center h-full p-12 text-white">
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/50 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-5xl font-black tracking-tighter">Speedy</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Your dream vehicle is just a login away.
          </h2>
          <p className="text-gray-300 text-lg">
            Sign in to access our verified Vehicle details, Sell your vehicles, track your inquiries and favorites, and pick up right where you left off.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white lg:bg-gray-50/50"
        style={{
          msOverflowStyle: 'none',  /* Internet Explorer and Edge */
          scrollbarWidth: 'none',   /* Firefox */
          WebkitScrollbar: { display: 'none' } /* Chrome, Safari and Opera */
        }}
      >
        <div className="min-h-full flex flex-col justify-center p-6 sm:p-12">
          <div className="w-full w-full lg:max-w-md lg:bg-white lg:p-10 lg:rounded-3xl lg:shadow-xl lg:border lg:border-gray-100 lg:my-auto mx-auto">
            
            {/* Logo for Mobile */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link to="/" className="flex items-center space-x-3 shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-md transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <span className="text-white font-bold text-2xl">S</span>
                  </div>
                  <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">Speedy</span>
              </Link>
            </div>
  
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500">Enter your credentials to access your account.</p>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
  
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                  <span className="ml-2 text-sm text-gray-600 font-medium">Remember me</span>
                </label>
                <Link to="/forgot-password" size="sm" className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
  
              <Button disabled={isLoading} type="submit" className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-red-200 transition-all active:scale-95">
                {isLoading ? 'Signing In...' : 'Sign In'}
                {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </form>
  
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-400">
                <span className="px-4 bg-white">Or</span>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                <FcGoogle className= "w-5 h-5" />
              </button>
              <button type="button" onClick={() => handleSocialLogin('Facebook')} className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                <FaFacebook className="text-blue-600 w-5 h-5" />
              </button>
            </div>
  
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-450">
                Don't have an account? <Link to="/register" state={{ from: location.state?.from }} className="text-red-600 font-bold hover:underline">Sign up</Link>
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] tracking-widest text-gray-400 leading-relaxed">
                  By logging in, you agree to Speedy's <br />
                  <Link to="/terms" className="text-gray-600 hover:text-red-600 underline">Terms of Service</Link> & <Link to="/privacy" className="text-gray-600 hover:text-red-600 underline">Privacy Policy</Link>
                </p>
              </div>
              <Link to="/" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
