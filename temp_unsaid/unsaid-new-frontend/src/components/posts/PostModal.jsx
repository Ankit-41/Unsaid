import React, { useState } from 'react';
import { postsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PostModal = ({ show, handleClose }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const MAX_CHARS = 500;
  const remainingChars = MAX_CHARS - content.length;
  const isOverLimit = remainingChars < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    
    if (isOverLimit) {
      toast.error(`Post exceeds maximum character limit of ${MAX_CHARS}`);
      return;
    }
    
    setLoading(true);
    
    try {
      await postsAPI.createPost({ content, isAnonymous });
      toast.success('Post submitted for approval');
      resetForm();
      handleClose();
    } catch (error) {
      console.error('Post creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setIsAnonymous(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-11/12 max-w-md shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Create a New Post</h2>
          <button onClick={handleClose} aria-label="Close" className="text-gray-600 hover:text-gray-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <textarea
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isOverLimit ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="What's on your mind? Share your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="5"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="form-checkbox"
                />
                <span>Post anonymously</span>
              </label>
              <small className={remainingChars <= 20 ? (remainingChars <= 0 ? 'text-red-500' : 'text-yellow-500') : 'text-gray-500'}>
                {remainingChars} characters remaining
              </small>
            </div>
          </div>
          <div className="p-4 border-t flex flex-col space-y-2">
            <button 
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
              disabled={loading || !content.trim() || isOverLimit}
            >
              {loading ? 'Posting...' : 'Share Post'}
            </button>
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <span>⚠️</span>
              <span>Your post will be reviewed by admins before being published</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
