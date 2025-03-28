
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Container from "@/components/layout/Container";
import Post from "@/components/Post";
import CreatePostModal from "@/components/CreatePostModal";
import { usePostContext } from "@/context/PostContext";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { posts } = usePostContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Simulate checking if user is logged in
  const isLoggedIn = true; // Would typically come from auth context

  React.useEffect(() => {
    // Redirect to login page if not logged in
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

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
          
          {posts.length === 0 ? (
            <div className="py-12 text-center glass-card rounded-xl animate-fade-in">
              <p className="text-lg">Loading posts...</p>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse delay-200"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div key={post.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <Post post={post} />
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <CreatePostModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />
    </div>
  );
};

export default Index;
