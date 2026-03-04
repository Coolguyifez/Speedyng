import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from "./components/ui/sonner";

// Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CarsPage from "./pages/CarsPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import ContactPage from "./pages/ContactPage";
import SellVehiclePage from './pages/SellVehiclePage';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPanel from "./pages/AdminPanel";
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy"; 
import TermsOfService from "./pages/TermsOfService";

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

function App() {
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Sync authentication state from LocalStorage
  const syncAuth = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Auth sync error", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    syncAuth();

    // Listen for storage changes (e.g., login from another tab or AuthCallback)
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback/:provider" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Protected Agent Routes */}
          <Route path="/Vehicles" element={
            <ProtectedRoute>
              <CarsPage />
            </ProtectedRoute>
          } />
           <Route path="/sell" element={
            <ProtectedRoute>
              <SellVehiclePage />
          } />   
          <Route path="/Vehicle/:id" element={
            <ProtectedRoute>
              <CarDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            <ProtectedRoute>
              <ContactPage />
            </ProtectedRoute>
          } />

          {/* Admin Route - Should technically have an Admin-specific Protected Route */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Only show the Speedy Chat Widget if the agent is logged in */}
        {user && <ChatWidget user={user} />}
      </BrowserRouter>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
