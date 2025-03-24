import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      // Adjust based on your API response shape:
      setUsers(response.data.data.users || response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (user) => {
    try {
      if (user.role === 'admin') {
        await adminAPI.removeAdmin(user._id);
        toast.success(`${user.name} is no longer an admin.`);
      } else {
        await adminAPI.makeAdmin(user._id);
        toast.success(`${user.name} is now an admin.`);
      }
      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin:', error);
      toast.error('Failed to update user role.');
    }
  };

  if (loading) {
    return <p className="text-center">Loading users...</p>;
  }

  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 capitalize">{user.role}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleToggleAdmin(user)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
