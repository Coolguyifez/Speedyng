import React, { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const AuthCallback = () => {
  const { provider } = useParams();
  const location = useLocation();
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (hasCalledAPI.current) return;

    const handleCallback = () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const userDataStr = params.get('user');

      if (token && userDataStr) {
        hasCalledAPI.current = true;
        try {
          const decodedUser = JSON.parse(decodeURIComponent(userDataStr));
          
          // 1. Save credentials to localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(decodedUser));

          // 2. GET THE MEMORY: Where was the user before logging in?
          const savedPath = sessionStorage.getItem('redirectAfterLogin');
          
          // 3. DECIDE DESTINATION: 
          // If a memory exists, use it. Otherwise, default to Home page
          const finalDestination = savedPath ? savedPath : '/';
          // 4. CLEAR THE MEMORY: Don't let it linger
          sessionStorage.removeItem('redirectAfterLogin');

          toast.success(`Welcome back, ${decodedUser.name}!`);
          
          // 5. REDIRECT: Hard reload to the correct path
          setTimeout(() => {
            window.location.href = finalDestination; 
          }, 500);

        } catch (err) {
          console.error("Speedy Auth Parsing Error:", err);
          toast.error("Failed to sync your profile.");
          window.location.href = '/login';
        }
      } else {
        toast.error("Authentication data missing.");
        window.location.href = '/login';
      }
    };

    handleCallback();
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-xs font-bold text-red-600 uppercase">S</span>
        </div>
      </div>
      <h2 className="mt-6 text-xl font-semibold text-gray-800">Finalizing your Login...</h2>
      <p className="mt-2 text-gray-500 italic">Welcome to Speedy Auto Broker Hub...</p>
    </div>
  );
};

export default AuthCallback;
