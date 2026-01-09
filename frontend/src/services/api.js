import axios from 'axios';

// Use localhost in development, external URL in production
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8001' 
  : process.env.REACT_APP_BACKEND_URL;

const API = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ Auth APIs ============
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ============ Car APIs ============
export const carAPI = {
  getCars: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/cars?${params.toString()}`);
    return response.data;
  },

  getFeaturedCars: async () => {
    const response = await api.get('/cars/featured');
    return response.data;
  },

  getCar: async (id) => {
    const response = await api.get(`/cars/${id}`);
    return response.data;
  },

  createCar: async (carData) => {
    const response = await api.post('/cars', carData);
    return response.data;
  },

  updateCar: async (id, carData) => {
    const response = await api.put(`/cars/${id}`, carData);
    return response.data;
  },

  deleteCar: async (id) => {
    const response = await api.delete(`/cars/${id}`);
    return response.data;
  },
};

// ============ Favorites APIs ============
export const favoritesAPI = {
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  addFavorite: async (carId) => {
    const response = await api.post(`/favorites/${carId}`);
    return response.data;
  },

  removeFavorite: async (carId) => {
    const response = await api.delete(`/favorites/${carId}`);
    return response.data;
  },
};

// ============ Contact API ============
export const contactAPI = {
  submitContact: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },

  getContacts: async () => {
    const response = await api.get('/contact');
    return response.data;
  },
};

// ============ Chat API ============
export const chatAPI = {
  sendMessage: async (sessionId, message) => {
    const response = await api.post('/chat', { session_id: sessionId, message });
    return response.data;
  },

  getChatHistory: async (sessionId) => {
    const response = await api.get(`/chat/${sessionId}`);
    return response.data;
  },
};

// ============ Stats APIs ============
export const statsAPI = {
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

export default api;
