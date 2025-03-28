import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Container from "@/components/layout/Container";
import Post from "@/components/Post";
import CreatePostModal from "@/components/CreatePostModal";
import { usePostContext } from "@/context/PostContext";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { posts, loading, fetchMorePosts, currentPage, totalPages } = usePostContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const loader = useRef(null);
  const navigate = useNavigate();

  // Simulate checking if user is logged in
  const isLoggedIn = true; // Would typically come from auth context

  useEffect(() => {
    // Redirect to login page if not logged in
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  // Handle intersection with the loader element
  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && !loading && !isFetchingMore && !hasReachedEnd) {
      loadMorePosts();
    }
  }, [loading, isFetchingMore, hasReachedEnd]);

  // Set up the intersection observer
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [handleObserver]);

  // Check if we've reached the last page
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setHasReachedEnd(true);
    }
  }, [currentPage, totalPages]);

  // Load more posts function
  const loadMorePosts = async () => {
    if (currentPage < totalPages) {
      setIsFetchingMore(true);
      await fetchMorePosts();
      setIsFetchingMore(false);
    } else if (!hasReachedEnd && totalPages > 0) {
      setHasReachedEnd(true);
      toast({
        title: "End of feed",
        description: "You've reached the end of the feed!",
      });
    }
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar onCreatePost={openCreateModal} />
      
      <main className="py-8">
        <Container>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Your Feed</h2>
            <Separator className="w-20 h-1 rounded-full bg-primary/20" />
          </div>
          
          {posts.length === 0 && loading ? (
            <div className="py-12 text-center glass-card rounded-xl animate-fade-in">
              <p className="text-lg">Loading posts...</p>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse delay-200"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {posts.map((post, index) => (
                  <div key={post.id} style={{ animationDelay: `${index * 0.1}s` }}>
                    <Post post={post} />
                  </div>
                ))}
              </div>
              
              {/* Loading indicator and observer element */}
              <div ref={loader} className="py-8 flex justify-center">
                {isFetchingMore && (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading more posts...</span>
                  </div>
                )}
                
                {hasReachedEnd && posts.length > 0 && (
                  <p className="text-muted-foreground text-sm">You've reached the end of the feed</p>
                )}
                
                {posts.length === 0 && !loading && (
                  <div className="py-12 text-center glass-card rounded-xl w-full">
                    <p className="text-lg">No posts found</p>
                  </div>
                )}
              </div>
            </>
          )}
        </Container>
      </main>

      <CreatePostModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />
    </div>
  );
};

export default Index;
