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
  getAll: () => api.get('/groups/'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups/', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
};

// Members API
export const membersAPI = {
  getAll: () => api.get('/members/'),
  getByGroup: (groupId) => api.get(`/members/group/${groupId}`),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members/', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  transferBC: (data) => api.post('/members/transfer-bc', data),
  editPending: (data) => api.post('/members/edit-pending', data),
};

// Payments API
export const paymentsAPI = {
  getAll: () => api.get('/payments/'),
  getByMember: (memberId) => api.get(`/payments/member/${memberId}`),
  create: (data) => api.post('/payments/', data),
  delete: (id) => api.delete(`/payments/${id}`),
};

// Auctions API
export const auctionsAPI = {
  getAll: () => api.get('/auctions/'),
  getById: (id) => api.get(`/auctions/${id}`),
  create: (data) => api.post('/auctions/', data),
  update: (id, data) => api.put(`/auctions/${id}`, data),
  delete: (id) => api.delete(`/auctions/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
