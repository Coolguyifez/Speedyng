import React, { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const AuthCallback = () => {
  const { provider } = useParams();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double-execution in React Strict Mode
    if (hasProcessed.current) return;

    const handleCallback = () => {
      console.log("1. AuthCallback initiated. URL Path:", location.search);
      
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const userDataStr = params.get('user');

      if (token && userDataStr) {
        hasProcessed.current = true;
        try {
          // 2. Decode the URI-encoded JSON string from the backend
          const decodedUser = JSON.parse(decodeURIComponent(userDataStr));
          console.log("2. Decoded User Data:", decodedUser);

          // 3. Save to LocalStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(decodedUser));
          console.log("3. Data saved to LocalStorage");

          // 4. Determine Destination (Memory check)
          const savedPath = sessionStorage.getItem('redirectAfterLogin');
          const finalDestination = savedPath && savedPath !== '/login' ? savedPath : '/';
          console.log("4. Target Destination:", finalDestination);

          toast.success(`Welcome back to Speedy, ${decodedUser.name}!`);

          // 6. Hard Redirect with slight delay
          // This delay ensures the browser finishes writing to storage 
          // before the page refreshes and the App reads the auth state.
          setTimeout(() => {
            console.log("5. Performing redirect now...");
            window.location.href = finalDestination; 
          }, 800);

        } catch (err) {
          console.error("CRITICAL: Speedy Auth Parsing Error:", err);
          toast.error("Failed to sync your profile.");
          window.location.href = '/login';
        }
      } else {
        console.warn("ERROR: Missing token or user in URL");
        toast.error("Authentication data missing.");
        // If we stay on login, it's because this 'else' block was hit.
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
      }
    };

    handleCallback();
  }, [location]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="relative">
        <div className="w-18 h-18 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-2x1">S</span>
        </div>
      </div>
      
    </div>
  );
};

export default AuthCallback;
