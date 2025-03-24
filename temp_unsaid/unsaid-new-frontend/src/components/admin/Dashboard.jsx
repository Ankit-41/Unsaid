import React, { useEffect, useState } from 'react';
import { postsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await postsAPI.getDashboardStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        toast.error('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats ? (
        <>
          <div className="bg-white shadow p-4 rounded">
            <h2 className="text-xl font-bold">Total Posts</h2>
            <p className="text-3xl">{stats.totalPosts}</p>
          </div>
          <div className="bg-white shadow p-4 rounded">
            <h2 className="text-xl font-bold">Pending Posts</h2>
            <p className="text-3xl">{stats.pendingPosts}</p>
          </div>
          <div className="bg-white shadow p-4 rounded">
            <h2 className="text-xl font-bold">Approved Posts</h2>
            <p className="text-3xl">{stats.approvedPosts}</p>
          </div>
        </>
      ) : (
        <p>No stats available.</p>
      )}
    </div>
  );
};

export default Dashboard;
