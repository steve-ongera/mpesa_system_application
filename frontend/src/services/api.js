import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh_token: refreshToken }),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.put('/users/update-profile/', data),
  changePin: (data) => api.post('/users/change-pin/', data),
  getBalance: () => api.get('/users/balance/'),
};

// Transaction APIs
export const transactionAPI = {
  getTransactions: (params) => api.get('/transactions/', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}/`),
  sendMoney: (data) => api.post('/transactions/send-money/', data),
  deposit: (data) => api.post('/transactions/deposit/', data),
  withdraw: (data) => api.post('/transactions/withdraw/', data),
  getRecent: () => api.get('/transactions/recent/'),
  getStatistics: () => api.get('/transactions/statistics/'),
};

// Wallet APIs
export const walletAPI = {
  getWallet: () => api.get('/wallets/my-wallet/'),
};

// Agent APIs
export const agentAPI = {
  getAgents: (params) => api.get('/agents/', { params }),
  getNearbyAgents: () => api.get('/agents/nearby/'),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications/', { params }),
  markAsRead: (id) => api.post(`/notifications/${id}/mark-read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
  clearAll: () => api.delete('/notifications/clear-all/'),
};

// Transaction Charge APIs
export const chargeAPI = {
  getCharges: (params) => api.get('/charges/', { params }),
};

export default api;