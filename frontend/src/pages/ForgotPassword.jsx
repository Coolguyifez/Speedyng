import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // FIX: Send an object { email: email } instead of just the string
      await authAPI.forgotPassword({ email: email }); 
      
      setIsSent(true);
      toast.success("Reset link sent to your email!");
    } catch (error) {
      console.error("Forgot password error:", error);
      
      // FIX: Safely parse FastAPI's 422 error detail array
      const detail = error.response?.data?.detail;
      let errorMessage = "Something went wrong.";

      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        // Pick the first validation error message from FastAPI
        errorMessage = detail[0]?.msg || "Invalid email format.";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {!isSent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
              <p className="text-gray-600 mt-2">No worries! Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                  placeholder="your@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
                <Send className="ml-2 w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Check your Email</h2>
            <p className="text-gray-600 mt-2">We've sent a password reset link to <br/><strong>{email}</strong></p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
