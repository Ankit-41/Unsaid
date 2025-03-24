import React, { useState } from 'react';

import Dashboard from '../components/admin/Dashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminPosts from '../components/admin/AdminPosts';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-center">Admin Panel</h1>
      </header>

      <nav className="flex justify-center space-x-4 border-b pb-2 mb-4">
        <button
          className={`px-4 py-2 focus:outline-none ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 focus:outline-none ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 focus:outline-none ${
            activeTab === 'posts'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
      </nav>

      <div>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'posts' && <AdminPosts />}
      </div>
    </div>
  );
};

export default AdminPage;
