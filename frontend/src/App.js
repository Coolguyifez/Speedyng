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

function App() {
  // Check if user is logged in to show/hide the Speedy Assistant globally
  const user = JSON.parse(localStorage.getItem('user'));

  
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
        </Routes>
        {user && <ChatWidget />}
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
