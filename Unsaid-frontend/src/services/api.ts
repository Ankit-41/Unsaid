import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle session expiry
    if (response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => 
    api.post('/auth/register', data),
  
  verifyEmail: (data: { email: string; otp: string }) => 
    api.post('/auth/verify-email', data),
  
  resendOTP: (data: { email: string }) => 
    api.post('/auth/resend-otp', data),
  
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  
  logout: () => 
    api.get('/auth/logout'),
  
  getMe: () => 
    api.get('/auth/me'),
};

// Posts API
export const postsAPI = {
  createPost: (data: { content: string; isAnonymous?: boolean }) => 
    api.post('/posts', data),
  
  getApprovedPosts: (page = 1, limit = 10) => 
    api.get(`/posts/approved?page=${page}&limit=${limit}`),
  
  getPostsByStatus: (status: 'pending' | 'approved' | 'disapproved' | 'removed', page = 1, limit = 10) => 
    api.get(`/posts/status/${status}?page=${page}&limit=${limit}`),
  
  getPost: (id: string) => 
    api.get(`/posts/${id}`),
  
  updatePostStatus: (id: string, data: { status: 'pending' | 'approved' | 'disapproved' | 'removed' }) => 
    api.patch(`/posts/${id}/status`, data),
  
  likePost: (id: string) => 
    api.post(`/posts/${id}/like`),
  
  unlikePost: (id: string) => 
    api.post(`/posts/${id}/unlike`),
  
  addComment: (id: string, data: { text: string }) => 
    api.post(`/posts/${id}/comments`, data),
  
  getMyPosts: (page = 1, limit = 10) => 
    api.get(`/posts/my-posts?page=${page}&limit=${limit}`),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => 
    api.get('/admin/users'),
  
  getDashboardStats: () => 
    api.get('/admin/dashboard'),
  
  getPostStats: () => 
    api.get('/admin/post-stats'),
  
  makeAdmin: (id: string) => 
    api.patch(`/admin/users/${id}/make-admin`),
  
  removeAdmin: (id: string) => 
    api.patch(`/admin/users/${id}/remove-admin`),
};

export default api;
