import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '@/services/api';
import { User } from '@/utils/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkUserAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token validity with the backend
          const response = await api.checkAuth();
          
          if (response.status === 'success') {
            setIsAuthenticated(true);
            setUser(response.data.user);
            
            // Ensure user info is stored in localStorage
            localStorage.setItem('userId', response.data.user._id);
            localStorage.setItem('userName', response.data.user.name);
            localStorage.setItem('userEmail', response.data.user.email);
            localStorage.setItem('userRole', response.data.user.role);
          } else {
            // Clear invalid auth state
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Error verifying authentication:', error);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    checkUserAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.login({ email, password });
      
      if (response.status === 'success') {
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        // Store user info in localStorage
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userRole', response.data.user.role);
        
        toast({
          title: 'Login successful',
          description: `Welcome back, ${response.data.user.name}!`,
        });
        return true;
      } else {
        toast({
          title: 'Login failed',
          description: response.message || 'Invalid credentials',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await api.logout();
      setIsAuthenticated(false);
      setUser(null);
      toast({
        title: 'Logout successful',
        description: 'You have been logged out successfully.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'An error occurred during logout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.register({ name, email, password });
      
      if (response.status === 'success') {
        toast({
          title: 'Registration successful',
          description: 'Please check your email for the OTP to verify your account.',
        });
        return true;
      } else {
        toast({
          title: 'Registration failed',
          description: response.message || 'Something went wrong',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'An error occurred during registration. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      setLoading(true);
      // This function needs to be implemented in the API
      const response = await fetch(`${api.API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      }).then(res => res.json());
      
      if (response.status === 'success') {
        // Store token and user info
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.data.user._id);
          localStorage.setItem('userName', response.data.user.name);
          localStorage.setItem('userEmail', response.data.user.email);
          localStorage.setItem('userRole', response.data.user.role);
        }
        
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        toast({
          title: 'Verification successful',
          description: 'Your email has been verified successfully!',
        });
        return true;
      } else {
        toast({
          title: 'Verification failed',
          description: response.message || 'Invalid OTP',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: 'Verification failed',
        description: 'An error occurred during verification. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        register,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 