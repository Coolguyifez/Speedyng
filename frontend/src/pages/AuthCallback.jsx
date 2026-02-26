import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

const AuthCallback = () => {
  const { provider } = useParams(); // Gets 'google', 'facebook', or 'apple' from URL
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      // Extract the 'code' from the URL: ?code=xxxx
      const params = new URLSearchParams(location.search);
      const code = params.get('code');

      if (!code) {
        toast.error("Failed to get authorization code");
        return navigate('/login');
      }

      try {
        // Send the code to your FastAPI backend
        const data = await authAPI.socialLogin(provider, code);
        
        // Save the JWT (usually handled inside your authAPI or context)
        toast.success(`Welcome to Speedy, ${data.user.name}!`);
        
        // Redirect to dashboard or where they were going
        navigate('/'); 
      } catch (err) {
        console.error(err);
        toast.error("Social authentication failed.");
        navigate('/login');
      }
    };

    handleCallback();
  }, [provider, location, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 font-medium italic">Speedy is verifying your account...</p>
    </div>
  );
};

export default AuthCallback;
