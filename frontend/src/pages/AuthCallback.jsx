import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

const AuthCallback = () => {
  const { provider } = useParams(); // 'google', 'facebook', or 'apple'
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use a ref to prevent strict-mode double-firing in development
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (hasCalledAPI.current) return;

    const handleCallback = async () => {
      // 1. Extract 'code' from URL (e.g. ?code=4/0Af...)
      const params = new URLSearchParams(location.search);
      const code = params.get('code');

      // 2. Handle missing code (User cancelled or error)
      if (!code) {
        const errorMsg = params.get('error') || "Authorization failed";
        toast.error(`Login Error: ${errorMsg}`);
        return navigate('/login');
      }

      try {
        hasCalledAPI.current = true;
        
        // 3. Exchange code for JWT through your Render backend
        // This calls api.get(`/auth/${provider}/callback`, { params: { code } })
        const data = await authAPI.socialLogin(provider, code);
        
        // 4. Success! Data (user & token) are saved in localStorage by authAPI
        toast.success(`Welcome back to Speedy, ${data.user.name || 'Agent'}!`);
        
        // 5. Direct to dashboard or homepage
        navigate('/dashboard', { replace: true }); 
      } catch (err) {
        console.error("Auth Error:", err);
        
        // 6. Detailed Error Messaging
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
