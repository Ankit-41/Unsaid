import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom, clearAuth } from '../atoms/authAtom';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const Navbar: React.FC = () => {
  const [auth, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setAuth(clearAuth());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-primary">
              Unsaid
            </Link>
            
            {auth.isAuthenticated && (
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="text-gray-600 hover:text-primary">
                  Home
                </Link>
                <Link to="/my-posts" className="text-gray-600 hover:text-primary">
                  My Posts
                </Link>
                {auth.user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-primary">
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {auth.isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Hello, {auth.user?.name}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
