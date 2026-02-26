import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

const AuthCallback = () => {
  const { provider } = useParams(); // 'google' or 'facebook'
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ref prevents React Strict Mode from running the exchange twice
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (hasCalledAPI.current) return;

    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      
      /**
       * OPTION A: DIRECT TOKEN REDIRECT
       * If your backend already verified the user and sent the token in the URL
       */
      const directToken = params.get('token');
      if (directToken) {
        hasCalledAPI.current = true;
        localStorage.setItem('token', directToken);
        toast.success("Welcome back to Speedy!");
        return navigate('/dashboard', { replace: true });
      }

      /**
       * OPTION B: STANDARD OAUTH CODE EXCHANGE
       * Most common: backend gives us a 'code', we send it back for a JWT
       */
      const code = params.get('code');

      if (!code) {
        const errorMsg = params.get('error') || "Authorization failed";
        toast.error(`Login Error: ${errorMsg}`);
        return navigate('/login');
      }

      try {
        hasCalledAPI.current = true;
        
        // Call backend to exchange the temporary 'code' for a permanent 'token'
        // This hits: GET /api/auth/${provider}/callback?code=...
        const data = await authAPI.socialLogin(provider, code);
        
        toast.success(`Welcome back, ${data.user?.name || 'Speedy Agent'}!`);
        
        // Redirect to dashboard or where they were going
        navigate('/dashboard', { replace: true }); 
        
        // Force a reload to ensure all components see the new Auth state
        window.location.reload();
      } catch (err) {
        console.error("Speedy Auth Error:", err);
        const backendMessage = err.response?.data?.detail || "Authentication failed.";
        toast.error(backendMessage);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [provider, location, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="relative">
        {/* Speedy-themed Loader */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-xs font-bold text-red-600 uppercase">S</span>
        </div>
      </div>
      
      <h2 className="mt-6 text-xl font-semibold text-gray-800">
        Verifying your credentials...
      </h2>
      <p className="mt-2 text-gray-500 text-center max-w-xs italic">
        Speedy is securely connecting your {provider} account. 
        Please do not refresh the page.
      </p>
    </div>
  );
};

export default AuthCallback;
