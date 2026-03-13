import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { MdLockReset } from "react-icons/md";
import { toast } from 'sonner';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      return toast.error("Passwords do not match!");
    }

    if (formData.new_password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setIsLoading(true);
    try {
      // Matches your ResetPasswordSubmit schema in backend
      await authAPI.resetPassword({
        token: token,
        new_password: formData.new_password
      });
      
      setIsSuccess(true);
      toast.success("Security updated! Password changed.");
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid or expired link.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Missing Token</h2>
          <p className="text-gray-600 mt-2">Please use the link sent to your email.</p>
          <Link to="/forgot-password" title="Try again" className="mt-4 inline-block text-blue-600 underline">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {!isSuccess ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdLockReset  className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
              <p className="text-gray-600 mt-2">Create a secure password for your Speedy account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    value={formData.new_password}
                    onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                />
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 shadow-lg shadow-black-200 transition-all active:scale-95 flex items-center justify-center"
              >
                {isLoading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Password Changed!</h2>
            <p className="text-gray-600 mt-3">Your security has been updated successfully.</p>
            <p className="text-sm text-gray-400 mt-2">Redirecting you to login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
