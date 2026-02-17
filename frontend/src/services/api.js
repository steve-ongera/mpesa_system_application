import axios from 'axios';

// ─────────────────────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────────────────────
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 s
});

// ─── Request interceptor — attach access token ────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — silent token refresh on 401 ──────
let isRefreshing   = false;
let pendingQueue   = []; // requests waiting for refresh

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // If 401 and not already retried
    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== '/auth/token/refresh/'
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing     = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        processQueue(error);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccess = data.access;
        localStorage.setItem('access_token', newAccess);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  register:     (data)         => api.post('/auth/register/', data),
  login:        (data)         => api.post('/auth/login/', data),
  logout:       (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  refreshToken: (refresh)      => api.post('/auth/token/refresh/', { refresh }),
};

// ─────────────────────────────────────────────────────────────
// User API
// ─────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:    ()     => api.get('/users/profile/'),
  updateProfile: (data) => api.put('/users/update-profile/', data),
  changePin:     (data) => api.post('/users/change-pin/', data),
  getBalance:    ()     => api.get('/users/balance/'),
  lookupPhone:   (phone)=> api.get(`/users/lookup/?phone=${phone}`),
};

// ─────────────────────────────────────────────────────────────
// Transaction API
// ─────────────────────────────────────────────────────────────
export const transactionAPI = {
  getTransactions: (params = {}) => api.get('/transactions/', { params }),
  getTransaction:  (id)          => api.get(`/transactions/${id}/`),
  sendMoney:       (data)        => api.post('/transactions/send-money/', data),
  deposit:         (data)        => api.post('/transactions/deposit/', data),
  withdraw:        (data)        => api.post('/transactions/withdraw/', data),
  getRecent:       ()            => api.get('/transactions/recent/'),
  getStatistics:   ()            => api.get('/transactions/statistics/'),
};

// ─────────────────────────────────────────────────────────────
// Wallet API
// ─────────────────────────────────────────────────────────────
export const walletAPI = {
  getWallet: () => api.get('/wallets/my-wallet/'),
};

// ─────────────────────────────────────────────────────────────
// Agent API
// ─────────────────────────────────────────────────────────────
export const agentAPI = {
  getAgents:      (params = {}) => api.get('/agents/', { params }),
  getNearbyAgents:(params = {}) => api.get('/agents/nearby/', { params }),
};

// ─────────────────────────────────────────────────────────────
// Notification API
// ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getNotifications: (params = {}) => api.get('/notifications/', { params }),
  markAsRead:       (id)          => api.post(`/notifications/${id}/mark-read/`),
  markAllAsRead:    ()            => api.post('/notifications/mark-all-read/'),
  getUnreadCount:   ()            => api.get('/notifications/unread-count/'),
  clearAll:         ()            => api.delete('/notifications/clear-all/'),
};

// ─────────────────────────────────────────────────────────────
// Charges API
// ─────────────────────────────────────────────────────────────
export const chargeAPI = {
  getCharges: () => api.get('/charges/'),
};