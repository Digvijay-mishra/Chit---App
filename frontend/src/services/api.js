import axios from 'axios';

// Get backend URL from environment variable
const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

console.log('=== API Configuration ===');
console.log('API Base URL:', API_BASE);
console.log('Environment:', process.env.NODE_ENV);
console.log('========================');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error?.message || error);
    if (error.response) {
      console.error('[API Response Error] Status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

// Groups API - using trailing slashes to match backend routes exactly
export const groupsAPI = {
  getAll: () => api.get('/api/groups/'),
  getById: (id) => api.get(`/api/groups/${id}`),
  create: (data) => api.post('/api/groups/', data),
  update: (id, data) => api.put(`/api/groups/${id}`, data),
  delete: (id) => api.delete(`/api/groups/${id}`),
};

// Members API
export const membersAPI = {
  getAll: () => api.get('/api/members/'),
  getByGroup: (groupId) => api.get(`/api/members/group/${groupId}`),
  getById: (id) => api.get(`/api/members/${id}`),
  create: (data) => api.post('/api/members/', data),
  update: (id, data) => api.put(`/api/members/${id}`, data),
  delete: (id) => api.delete(`/api/members/${id}`),
  transferBC: (data) => api.post('/api/members/transfer-bc', data),
  editPending: (data) => api.post('/api/members/edit-pending', data),
};

// Payments API
export const paymentsAPI = {
  getAll: () => api.get('/api/payments/'),
  getByMember: (memberId) => api.get(`/api/payments/member/${memberId}`),
  create: (data) => api.post('/api/payments/', data),
  delete: (id) => api.delete(`/api/payments/${id}`),
};

// Auctions API
export const auctionsAPI = {
  getAll: () => api.get('/api/auctions/'),
  getById: (id) => api.get(`/api/auctions/${id}`),
  create: (data) => api.post('/api/auctions/', data),
  update: (id, data) => api.put(`/api/auctions/${id}`, data),
  delete: (id) => api.delete(`/api/auctions/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export default api;
