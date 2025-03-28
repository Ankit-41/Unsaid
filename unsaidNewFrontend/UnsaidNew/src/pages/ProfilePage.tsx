import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Container from "@/components/layout/Container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePostContext } from "@/context/PostContext";
import Post from "@/components/Post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreatePostModal from "@/components/CreatePostModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import * as api from '@/services/api';

const ProfilePage = () => {
  const { posts } = usePostContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's posts from the API
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        const response = await api.getMyPosts();
        if (response.status === 'success') {
          setMyPosts(response.data.posts.map((post) => ({
            id: post._id,
            username: post.isAnonymous ? 'Anonymous' : post.author?.name,
            content: post.content,
            imageUrl: post.image,
            timestamp: new Date(post.createdAt).toLocaleString(),
            likes: post.likes.length,
            isLiked: post.likes.includes(localStorage.getItem('userId')),
            comments: post.comments.map((comment) => ({
              id: comment._id,
              username: comment.user?.name || 'Unknown',
              content: comment.text,
              timestamp: new Date(comment.createdAt).toLocaleString()
            })),
            spicyLevel: post.spicyLevel,
            isAnonymous: post.isAnonymous
          })));
        }
      } catch (error) {
        console.error('Error fetching my posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  // Filter posts for regular and anonymous tabs
  const userPosts = myPosts.filter(post => !post.isAnonymous);
  const anonymousPosts = myPosts.filter(post => post.isAnonymous);

  return (
    <div className="min-h-screen">
      <Navbar onCreatePost={openCreateModal} />
      
      <main className="py-8">
        <Container>
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3 text-center md:text-left">
                <div>
                  <h1 className="text-2xl font-bold">{user?.name || 'Loading...'}</h1>
                  <p className="text-muted-foreground">{user?.email || 'Loading...'}</p>
                </div>
                
                <p>IITR student sharing thoughts and experiences on campus.</p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings size={14} />
                    Edit Profile
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <LogOut size={14} />
                    Log Out
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Tabs for Posts */}
            <Tabs defaultValue="my-posts" className="w-full">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
                <TabsTrigger value="my-posts">My Posts</TabsTrigger>
                <TabsTrigger value="anonymous">Anonymous Posts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="my-posts" className="mt-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-t-primary border-r-primary border-b-transparent border-l-transparent"></div>
                    <p className="mt-2">Loading your posts...</p>
                  </div>
                ) : userPosts.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-6 pr-4">
                      {userPosts.map((post) => (
                        <Post key={post.id} post={post} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 glass-card rounded-xl">
                    <p className="text-lg mb-4">You haven't created any posts yet</p>
                    <Button onClick={openCreateModal} className="gap-2">
                      <Plus size={16} />
                      Create Your First Post
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="anonymous" className="mt-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-t-primary border-r-primary border-b-transparent border-l-transparent"></div>
                    <p className="mt-2">Loading your posts...</p>
                  </div>
                ) : anonymousPosts.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-6 pr-4">
                      {anonymousPosts.map((post) => (
                        <Post key={post.id} post={post} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 glass-card rounded-xl">
                    <p className="text-lg mb-4">You haven't created any anonymous posts yet</p>
                    <Button onClick={openCreateModal} className="gap-2">
                      <Plus size={16} />
                      Create Anonymous Post
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Container>
      </main>
      
      <CreatePostModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />
    </div>
  );
};

export default ProfilePage;
