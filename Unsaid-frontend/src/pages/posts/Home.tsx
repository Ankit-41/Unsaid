import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { postsAtom, Post } from '../../atoms/postAtom';
import { postsAPI } from '../../services/api';
import PostForm from '../../components/posts/PostForm';
import PostCard from '../../components/posts/PostCard';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const [postsState, setPostsState] = useAtom(postsAtom);
  const [loading, setLoading] = useState(false);
  
  // Fetch approved posts
  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await postsAPI.getApprovedPosts(page);
      const { posts, currentPage, totalPages } = response.data.data;
      
      setPostsState({
        ...postsState,
        posts: page === 1 ? posts : [...postsState.posts, ...posts],
        currentPage,
        totalPages,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setPostsState({
        ...postsState,
        loading: false,
        error: error.response?.data?.message || 'Failed to load posts'
      });
      toast.error('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle post update
  const handlePostUpdate = (updatedPost: Post) => {
    const updatedPosts = postsState.posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    );
    
    setPostsState({
      ...postsState,
      posts: updatedPosts
    });
  };
  
  // Handle load more
  const handleLoadMore = () => {
    if (postsState.currentPage < postsState.totalPages) {
      fetchPosts(postsState.currentPage + 1);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <PostForm onPostCreated={() => fetchPosts(1)} />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Gossips</h2>
        
        {postsState.loading && postsState.posts.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : postsState.posts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No gossips yet. Be the first to share one!</p>
          </div>
        ) : (
          <>
            {postsState.posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                onUpdate={handlePostUpdate}
              />
            ))}
            
            {postsState.currentPage < postsState.totalPages && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
