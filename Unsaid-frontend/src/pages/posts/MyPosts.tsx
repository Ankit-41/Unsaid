import React, { useEffect, useState } from 'react';
import { postsAPI } from '../../services/api';
import { Post } from '../../atoms/postAtom';
import PostCard from '../../components/posts/PostCard';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import toast from 'react-hot-toast';

const MyPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch user's posts
  const fetchMyPosts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await postsAPI.getMyPosts(page);
      const { posts: newPosts, currentPage, totalPages } = response.data.data;
      
      setPosts(page === 1 ? newPosts : [...posts, ...newPosts]);
      setCurrentPage(currentPage);
      setTotalPages(totalPages);
    } catch (error: any) {
      console.error('Error fetching my posts:', error);
      toast.error('Failed to load your posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load posts on component mount
  useEffect(() => {
    fetchMyPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle post update
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };
  
  // Handle load more
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchMyPosts(currentPage + 1);
    }
  };
  
  // Filter posts by status
  const pendingPosts = posts.filter(post => post.status === 'pending');
  const approvedPosts = posts.filter(post => post.status === 'approved');
  const disapprovedPosts = posts.filter(post => post.status === 'disapproved');
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Posts</h1>
      
      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingPosts.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedPosts.length})</TabsTrigger>
          <TabsTrigger value="disapproved">Disapproved ({disapprovedPosts.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {posts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You haven't posted any gossips yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onUpdate={handlePostUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          {pendingPosts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You don't have any pending posts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onUpdate={handlePostUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          {approvedPosts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You don't have any approved posts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedPosts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onUpdate={handlePostUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="disapproved" className="mt-6">
          {disapprovedPosts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You don't have any disapproved posts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disapprovedPosts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onUpdate={handlePostUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {currentPage < totalPages && (
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
    </div>
  );
};

export default MyPosts;
