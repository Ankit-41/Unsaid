import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import PostManagement from './PostManagement';
import UserManagement from './UserManagement';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  disapprovedPosts: number;
  removedPosts: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardStats();
  }, []);
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats?.totalPosts || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats?.pendingPosts || 0}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Post Status Breakdown */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Post Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-sm text-yellow-600 mb-1">Pending</p>
                  <p className="text-xl font-bold">{stats?.pendingPosts || 0}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm text-green-600 mb-1">Approved</p>
                  <p className="text-xl font-bold">{stats?.approvedPosts || 0}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-sm text-red-600 mb-1">Disapproved</p>
                  <p className="text-xl font-bold">{stats?.disapprovedPosts || 0}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Removed</p>
                  <p className="text-xl font-bold">{stats?.removedPosts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Management Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-8">
              <TabsTrigger value="posts">Post Management</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              <PostManagement />
            </TabsContent>
            
            <TabsContent value="users">
              <UserManagement onUserUpdated={fetchDashboardStats} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Dashboard;
