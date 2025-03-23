import { atom } from 'jotai';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  verified: boolean;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

// Initial auth state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true
};

// Load auth state from localStorage on initialization
const loadAuthState = (): AuthState => {
  if (typeof window === 'undefined') return initialAuthState;
  
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) return initialAuthState;
    
    const user = JSON.parse(userStr) as User;
    
    return {
      isAuthenticated: true,
      user,
      token,
      loading: false
    };
  } catch (error) {
    console.error('Error loading auth state from localStorage:', error);
    return initialAuthState;
  }
};

// Auth atom
export const authAtom = atom<AuthState>(loadAuthState());

// Helper functions to update auth state
export const setAuth = (state: AuthState) => {
  if (state.token && state.user) {
    localStorage.setItem('token', state.token);
    localStorage.setItem('user', JSON.stringify(state.user));
  }
  return state;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return initialAuthState;
};
