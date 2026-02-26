import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import HomePage from "./pages/HomePage";
import CarsPage from "./pages/CarsPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';
import AuthCallback from './pages/AuthCallback';

function App() {
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false); // New: Tracks if we are in the browser

  useEffect(() => {
    setIsMounted(true); // We are now safely in the browser
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Auth sync error", e);
      }
    }
  }, []);

  // If we haven't mounted yet, render a blank shell to match the server
  if (!isMounted) {
    return <div className="App" />;
  }

  
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Vehicles" element={<ProtectedRoute><CarsPage /> </ProtectedRoute>} />
          <Route path="/Vehicle/:id" element={<ProtectedRoute><CarDetailsPage /> </ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><ContactPage /> </ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/auth/callback/:provider" element={<AuthCallback />} />
        </Routes>
        {user && <ChatWidget />}
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
