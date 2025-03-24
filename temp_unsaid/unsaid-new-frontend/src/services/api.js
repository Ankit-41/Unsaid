import axios from 'axios';

const API_BASE_URL = 'https://unsaid-backend.vercel.app/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API endpoints
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Check that the response contains token and the user is in response.data.data.user
    if (response.data.token && response.data.data && response.data.data.user) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },
  verifyEmail: async (verificationData) => {
    const response = await api.post('/auth/verify-email', verificationData);
    return response.data;
  },
  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  refreshToken: () => api.post('/auth/refresh-token')
};

// User API endpoints
export const userAPI = {
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.post('/users/change-password', passwordData),
  deleteAccount: () => api.delete('/users/account')
};

// Posts API endpoints
export const postsAPI = {
  getApprovedPosts: (page = 1, limit = 5) => api.get(`/posts/approved?page=${page}&limit=${limit}`),
  getMyPosts: (page = 1, limit = 5) => api.get(`/posts/my-posts?page=${page}&limit=${limit}`),
  createPost: (postData) => api.post('/posts', postData),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.post(`/posts/${postId}/unlike`),
  addComment: (postId, commentData) =>
    api.post(`/posts/${postId}/comments`, commentData, { withCredentials: true }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
  // NEW admin endpoints:
  getAllPosts: (page = 1, limit = 20) => api.get(`/posts/all?page=${page}&limit=${limit}`),
  updatePostStatus: (postId, status) => api.patch(`/posts/${postId}/status`, { status }),
  searchPosts: (query) => api.get(`/posts/search?q=${encodeURIComponent(query)}`),
  getDashboardStats: () => api.get('/admin/dashboard')
};

// Admin user management API endpoints
export const adminAPI = {
  getAllUsers: (page = 1, limit = 20) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  makeAdmin: (userId) => api.patch(`/admin/users/${userId}/make-admin`),
  removeAdmin: (userId) => api.patch(`/admin/users/${userId}/remove-admin`),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  searchUsers: (query) => api.get(`/admin/users/search?q=${encodeURIComponent(query)}`)
};

// Notifications API endpoints
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};

export default api;
