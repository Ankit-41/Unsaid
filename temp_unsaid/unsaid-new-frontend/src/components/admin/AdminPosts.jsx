// AdminPosts.jsx
import React, { useEffect, useState } from 'react';
import { postsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusOptions = ['pending', 'approved', 'disapproved', 'removed'];

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let response;
      if (searchQuery.trim()) {
        // Use the search endpoint
        response = await postsAPI.searchPosts(searchQuery);
      } else {
        response = await postsAPI.getAllPosts();
      }
      let fetchedPosts = response.data.data.posts || response.data.data;
      // Apply filter if selected
      if (filterStatus) {
        fetchedPosts = fetchedPosts.filter(
          (post) => post.status === filterStatus
        );
      }
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchQuery]);

  const handleStatusChange = async (postId, newStatus) => {
    try {
      await postsAPI.updatePostStatus(postId, newStatus);
      toast.success('Post status updated.');
      fetchPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
      toast.error('Failed to update post status.');
    }
  };

  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Posts Management</h2>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <label className="mr-2 font-semibold">Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded w-full md:w-64"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="p-4 border rounded shadow">
              <div className="mb-2">
                <span className="font-semibold">Author:</span>{' '}
                {post.isAnonymous ? 'Anonymous' : post.author?.name}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Content:</span> {post.content}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Status:</span>{' '}
                <span className="capitalize">{post.status}</span>
              </div>
              <div className="flex space-x-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(post._id, status)}
                    className={`px-3 py-1 text-sm rounded ${
                      post.status === status
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
