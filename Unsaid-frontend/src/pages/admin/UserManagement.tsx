import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { User } from '../../atoms/authAtom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import toast from 'react-hot-toast';

interface UserManagementProps {
  onUserUpdated?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserUpdated }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle make admin
  const handleMakeAdmin = async (userId: string) => {
    setActionInProgress(userId);
    try {
      await adminAPI.makeAdmin(userId);
      
      // Update user in state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: 'admin' } : user
      ));
      
      toast.success('User is now an admin');
      
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      toast.error('Failed to update user role');
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Handle remove admin
  const handleRemoveAdmin = async (userId: string) => {
    setActionInProgress(userId);
    try {
      await adminAPI.removeAdmin(userId);
      
      // Update user in state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: 'user' } : user
      ));
      
      toast.success('Admin privileges removed');
      
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to update user role');
    } finally {
      setActionInProgress(null);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map(user => (
            <Card key={user._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-1 flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                      
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        user.verified 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    {user.role === 'admin' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveAdmin(user._id)}
                        disabled={actionInProgress === user._id}
                      >
                        {actionInProgress === user._id ? '...' : 'Remove Admin'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-purple-600 border-purple-600 hover:bg-purple-50"
                        onClick={() => handleMakeAdmin(user._id)}
                        disabled={actionInProgress === user._id}
                      >
                        {actionInProgress === user._id ? '...' : 'Make Admin'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
