import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from 'lucide-react';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
// FIX: Import directly to prevent the "white screen" crash
import { authAPI } from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //Get the "from" path (where the user came from)
  // If they just clicked "Login" normally, this defaults to "/"
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSocialRegister = (provider) => {
  sessionStorage.setItem('redirectAfterLogin', from);
  console.log("Memory Saved:", from);
   
  // Use the same callback routes as Login to keep things simple
  const REDIRECT_BASE = "https://speedy-backend-fb9s.onrender.com/api/auth";
  const redirectUri = `${REDIRECT_BASE}/${provider.toLowerCase()}/callback`;
  
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
  if (!config) return toast.error("Provider not configured");

  const query = new URLSearchParams(config.params).toString();
  window.location.href = `${config.url}?${query}`;
};
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- ADDED VALIDATION CHECK ---
    if (!agreedToTerms) {
      toast.error('You must agree to the Terms of Service');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    try {
      // Logic for real database registration
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      toast.success('Account created successfully! Welcome to Speedy.');
      navigate(from, { replace: true }); // Redirect to home/dashboard
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.detail || 'Registration failed.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans bg-white overflow-hidden">
      
      {/* LEFT SIDE: Brand Image & Marketing (Visible only on Laptop/Large Screens) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-black">
        <img 
          src="https://images.unsplash.com/photo-1708788104655-f252fe9addd2?q=80&w=1107&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Performance Car" 
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
            Find the vehicle you’ve always wanted.
          </h2>
          <p className="text-gray-300 text-lg">
            Join Speedy today to browse thousands of verified listings and connect with our agents who will handle the hard work for you.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Register Form */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white lg:bg-gray-50/50"
        style={{
          msOverflowStyle: 'none',  /* Internet Explorer and Edge */
          scrollbarWidth: 'none',   /* Firefox */
          WebkitScrollbar: { display: 'none' } /* Chrome, Safari and Opera */
        }}
      >
        <div className="min-h-full flex flex-col justify-center p-6 sm:p-12">
          <div className="w-full w-full lg:max-w-md lg:bg-white lg:p-10 lg:rounded-3xl lg:shadow-xl lg:border lg:border-gray-100 lg:my-auto mx-auto">
            
            {/* Logo for Mobile only */}
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
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500">Join Speedy to find your perfect vehicle</p>
            </div>
  
            {/* Social Registration Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button type="button" onClick={() => handleSocialRegister('Google')} className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                <FaGoogle className="text-red-500 w-5 h-5" /> 
              </button>
              <button type="button" onClick={() => handleSocialRegister('Facebook')} className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                <FaFacebook className="text-blue-600 w-5 h-5" /> 
              </button>
            </div>
  
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-xs tracking-widest font-bold text-gray-400">
                <span className="px-4 bg-white uppercase">Or</span>
              </div>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5" />
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5" />
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    placeholder="08135877104"
                  />
                </div>
              </div>
  
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                      className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
  
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                      className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {/* TERMS CHECKBOX */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="agree"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="agree" className="text-[11px] text-gray-600 leading-relaxed cursor-pointer">
                  I agree to the <Link to="/terms" className="text-red-600 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-red-600 font-bold hover:underline">Privacy Policy</Link>.
                </label>
              </div>
  
              <Button disabled={isLoading} type="submit" className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-red-200 transition-all active:scale-95">
                {isLoading ? 'Creating Account...' : 'Create Account'}
                {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </form>
  
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-450">
                Already have an account? <Link to="/login" state={{ from: location.state?.from }} className="text-red-600 font-bold hover:underline">Sign in</Link>
              </p>
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

export default RegisterPage;
