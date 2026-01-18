import axios from 'axios';

// 1. Create the base axios instance
const api = axios.create({
  // Ensure this matches your live Render backend URL
  baseURL: 'https://speedy-backend-7lq3.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Automatically attach Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Auth API: Handles Login, Registration, and User state
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // This is the function Header.jsx was missing (fixing your white screen)
  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Force a redirect to clear any sensitive state
    window.location.href = '/login';
  }
};

// 4. Car API: Handles Inventory
export const carAPI = {
  getAll: (category) => api.get('/cars', { params: { category } }),
  getOne: (id) => api.get(`/cars/${id}`), 
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
  delete: (id) => api.delete(`/cars/${id}`),
  saveChatMessage: (messageData) => api.post('/chat/save', {
    text: messageData.text,
    sender: messageData.sender,
    timestamp: messageData.timestamp
  }),

  // Fetches the history list for the specific user
  getChatHistory: (userId) => api.get(`/chat/history/${userId}`),
};

// 5. Contact & Stats
export const contactAPI = {
  send: (data) => api.post('/contact', data),
};

export const statsAPI = {
  getDashboardStats: () => api.get('/stats'),
};

export default api;
