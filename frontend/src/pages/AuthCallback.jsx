import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const AuthCallback = () => {
  const { provider } = useParams();
  const location = useLocation();
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (hasCalledAPI.current) return;

    const handleCallback = () => {
      const params = new URLSearchParams(location.search);
      
      // 1. Get the data we sent from the Python RedirectResponse
      const token = params.get('token');
      const userDataStr = params.get('user');

      if (token && userDataStr) {
        hasCalledAPI.current = true;
        try {
          // 2. Decode the URI-encoded JSON string
          const decodedUser = JSON.parse(decodeURIComponent(userDataStr));
          
          // 3. Save BOTH to localStorage so the whole app sees you
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(decodedUser));

          toast.success(`Welcome back, ${decodedUser.name}!`);
          
          // 4. THE MAGIC TRICK: window.location.href
          // React 'navigate' doesn't always trigger a re-render of the Navbar.
          // This forces a fresh load of Speedy with your new credentials.
          setTimeout(() => {
            window.location.href = '/Vehicles'; 
          }, 500);

        } catch (err) {
          console.error("Speedy Auth Parsing Error:", err);
          toast.error("Failed to sync your profile.");
          window.location.href = '/login';
        }
      } else {
        // Fallback for missing params
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
      <p className="mt-2 text-gray-500 italic">Syncing your Speedy Agent profile...</p>
    </div>
  );
};

export default AuthCallback;
