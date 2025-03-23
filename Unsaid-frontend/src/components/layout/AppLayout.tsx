import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom } from '../../atoms/authAtom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';

const AppLayout: React.FC = () => {
  const [auth] = useAtom(authAtom);

  // If not authenticated, redirect to login
  if (!auth.isAuthenticated && !auth.loading) {
    return <Navigate to="/login" />;
  }

  // Show loading state
  if (auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default AppLayout;
