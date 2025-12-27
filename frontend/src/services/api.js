import axios from 'axios';

// Use relative path for API calls - this ensures same protocol as the page
// The /api prefix will be handled by the ingress to route to backend
const API_BASE = '/api';

console.log('=== API Configuration ===');
console.log('Using relative API path:', API_BASE);
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
