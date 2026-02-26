import axios from 'axios';

// 1. Create the base axios instance
const api = axios.create({
  // Ensure this matches your live Render backend URL
  baseURL: 'https://speedy-backend-fb9s.onrender.com/api',
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

  // NEW: Function to exchange the 'code' from Google/FB/Apple for a Speedy JWT
  socialLogin: async (provider, code) => {
    // This calls your FastAPI endpoint e.g., /api/auth/google/callback?code=...
    const response = await api.get(`/auth/${provider}/callback`, {
      params: { code }
    });
    
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
export const vehicleAPI = {
  getAll: (category = null) => {
    // If category is "All" or null, don't send a param
    const config = category && category !== 'All' ? { params: { category } } : {};
    return api.get('/vehicles', config);
  },
  getOne: (id) => api.get(`/vehicles/${id}`), 
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),


  // --- Chat Functions --
  saveChatMessage: (messageData) => {
    return api.post('/chat/save', {
      content: messageData.content || messageData.text,
      sender: messageData.sender,
      timestamp: messageData.timestamp || new Date().toISOString()
    });
  },
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
