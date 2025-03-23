import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { adminPostsAtom, Post } from '../../atoms/postAtom';
import { postsAPI } from '../../services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import PostCard from '../../components/posts/PostCard';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

const PostManagement: React.FC = () => {
  const [adminPosts, setAdminPosts] = useAtom(adminPostsAtom);
  
  // Fetch posts by status
  const fetchPostsByStatus = async (status: 'pending' | 'approved' | 'disapproved' | 'removed', page = 1) => {
    try {
      const response = await postsAPI.getPostsByStatus(status, page);
      const { posts, currentPage, totalPages } = response.data.data;
      
      setAdminPosts({
        ...adminPosts,
        [status]: {
          posts: page === 1 ? posts : [...adminPosts[status].posts, ...posts],
          currentPage,
          totalPages,
          loading: false,
          error: null
        }
      });
    } catch (error: any) {
      console.error(`Error fetching ${status} posts:`, error);
      setAdminPosts({
        ...adminPosts,
        [status]: {
          ...adminPosts[status],
          loading: false,
          error: error.response?.data?.message || `Failed to load ${status} posts`
        }
      });
      toast.error(`Failed to load ${status} posts. Please try again.`);
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    const status = value as 'pending' | 'approved' | 'disapproved' | 'removed';
    setAdminPosts({
      ...adminPosts,
      activeTab: status
    });
    
    // Load posts if not already loaded
    if (adminPosts[status].posts.length === 0 && !adminPosts[status].loading) {
      setAdminPosts({
        ...adminPosts,
        [status]: {
          ...adminPosts[status],
          loading: true
        }
      });
      fetchPostsByStatus(status);
    }
  };
  
  // Handle post update
  const handlePostUpdate = (updatedPost: Post) => {
    // Update post in current tab
    const status = adminPosts.activeTab;
    const updatedPosts = adminPosts[status].posts.filter(post => post._id !== updatedPost._id);
    
    setAdminPosts({
      ...adminPosts,
      [status]: {
        ...adminPosts[status],
        posts: updatedPosts
      }
    });
    
    // If post status changed, add to appropriate tab
    if (updatedPost.status !== status) {
      setAdminPosts({
        ...adminPosts,
        [updatedPost.status]: {
          ...adminPosts[updatedPost.status],
          posts: [updatedPost, ...adminPosts[updatedPost.status].posts]
        }
      });
    }
    
    // Refresh counts for all tabs
    fetchPostsByStatus('pending', 1);
    fetchPostsByStatus('approved', 1);
    fetchPostsByStatus('disapproved', 1);
    fetchPostsByStatus('removed', 1);
  };
  
  // Handle load more
  const handleLoadMore = (status: 'pending' | 'approved' | 'disapproved' | 'removed') => {
    if (adminPosts[status].currentPage < adminPosts[status].totalPages) {
      fetchPostsByStatus(status, adminPosts[status].currentPage + 1);
    }
  };
  
  // Load pending posts on component mount
  useEffect(() => {
    setAdminPosts({
      ...adminPosts,
      pending: {
        ...adminPosts.pending,
        loading: true
      }
    });
    fetchPostsByStatus('pending');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Post Management</h2>
      
      <Tabs 
        value={adminPosts.activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({adminPosts.pending.posts.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({adminPosts.approved.posts.length})
          </TabsTrigger>
          <TabsTrigger value="disapproved">
            Disapproved ({adminPosts.disapproved.posts.length})
          </TabsTrigger>
          <TabsTrigger value="removed">
            Removed ({adminPosts.removed.posts.length})
          </TabsTrigger>
        </TabsList>
        
        {(['pending', 'approved', 'disapproved', 'removed'] as const).map(status => (
          <TabsContent key={status} value={status} className="mt-6">
            {adminPosts[status].loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : adminPosts[status].posts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No {status} posts found.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {adminPosts[status].posts.map(post => (
                    <PostCard 
                      key={post._id} 
                      post={post} 
                      onUpdate={handlePostUpdate}
                      showAdminControls
                    />
                  ))}
                </div>
                
                {adminPosts[status].currentPage < adminPosts[status].totalPages && (
                  <div className="flex justify-center mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => handleLoadMore(status)}
                      disabled={adminPosts[status].loading}
                    >
                      {adminPosts[status].loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PostManagement;
