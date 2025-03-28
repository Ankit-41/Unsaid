import React, { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import { AdminNavbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  ShieldAlert, 
  Shield, 
  Trash2, 
  ChevronDown, 
  Check, 
  X, 
  AlertCircle,
  Flame,
  Filter,
  Image,
  Eye,
  EyeOff
} from "lucide-react";
import * as api from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const AdminPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("users");
  
  // User management states
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState({ isOpen: false, userId: null });
  
  // Post management states
  const [posts, setPosts] = useState([]);
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState("all");
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Fetch users when tab is "users"
  useEffect(() => {
    if (tab === "users") {
      fetchUsers();
    }
  }, [tab]);
  
  // Fetch posts when tab is "posts" or filter changes
  useEffect(() => {
    if (tab === "posts") {
      fetchPosts();
    }
  }, [tab, postStatusFilter]);
  
  // Clear search when tab changes
  useEffect(() => {
    setUserSearchQuery("");
    setPostSearchQuery("");
  }, [tab]);
  
  // Fetch users with search
  useEffect(() => {
    if (tab === "users" && userSearchQuery) {
      const timeoutId = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [userSearchQuery]);
  
  // Fetch posts with search
  useEffect(() => {
    if (tab === "posts" && postSearchQuery) {
      const timeoutId = setTimeout(() => {
        searchPosts();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [postSearchQuery]);
  
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // For testing, use a direct endpoint
      const response = await fetch(`${api.API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Users data:", data);

      if (data.status === "success") {
        setUsers(data.data.users || []);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  const searchUsers = async () => {
    if (!userSearchQuery.trim()) return;
    
    setIsLoadingUsers(true);
    try {
      // For testing, use a direct endpoint
      const response = await fetch(`${api.API_BASE_URL}/admin/users/search?q=${encodeURIComponent(userSearchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("User search data:", data);

      if (data.status === "success") {
        setUsers(data.data.users || []);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to search users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to search users, the endpoint may not be implemented",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      let response;
      if (postStatusFilter === "all") {
        response = await api.getAllPosts();
      } else {
        response = await api.getPostsByStatus(postStatusFilter);
      }
      
      if (response && response.status === "success") {
        // Process posts to ensure images are correctly formatted
        const posts = response.data.posts.map(post => {
          // Handle Cloudinary URLs (they should work as-is)
          if (post.image && !post.imageUrl) {
            post.imageUrl = post.image; // Ensure imageUrl is set if image field exists
          }
          
          console.log("Post with image:", {
            id: post.id || post._id,
            hasImage: !!post.image,
            imageUrl: post.imageUrl,
            image: post.image
          });
          
          return post;
        });
        
        setPosts(posts);
      } else {
        toast({
          title: "Error",
          description: (response && response.message) || "Failed to fetch posts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPosts(false);
    }
  };
  
  const searchPosts = async () => {
    if (!postSearchQuery.trim()) return;
    
    setIsLoadingPosts(true);
    try {
      const response = await api.searchPosts(postSearchQuery);
      if (response.status === "success") {
        setPosts(response.data.posts);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to search posts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching posts:", error);
      toast({
        title: "Error",
        description: "Failed to search posts",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPosts(false);
    }
  };
  
  const handleUpdateUserRole = async (userId, role) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Try direct API call using the services/api module
      const response = await api.updateUserRole(userId, role);
      console.log("Role update response:", response);

      if (response && response.status === "success") {
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: (response && response.message) || "Failed to update user role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteUser = async () => {
    if (!deleteUserDialog.userId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive",
      });
      setDeleteUserDialog({ isOpen: false, userId: null });
      return;
    }
    
    try {
      console.log(`Attempting to delete user with ID: ${deleteUserDialog.userId}`);
      
      const response = await api.deleteUser(deleteUserDialog.userId);
      
      console.log("User deletion response:", response);
      
      if (response && response.status === "success") {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        setDeleteUserDialog({ isOpen: false, userId: null });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: (response && response.message) || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdatePostStatus = async (postId, status) => {
    if (!postId) {
      toast({
        title: "Error",
        description: "Invalid post ID",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await api.updatePostStatus(postId, status);
      if (response.status === "success") {
        toast({
          title: "Success",
          description: "Post status updated successfully",
        });
        fetchPosts();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update post status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating post status:", error);
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdatePostSpicyLevel = async (postId, spicyLevel) => {
    if (!postId) {
      toast({
        title: "Error",
        description: "Invalid post ID",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log(`Sending spicy level update for post ${postId} to level ${spicyLevel}`);
      
      const response = await api.updatePostSpicyLevel(postId, spicyLevel);
      
      console.log("Spicy level update response:", response);
      
      if (response && response.status === "success") {
        toast({
          title: "Success",
          description: "Post spicy level updated successfully",
        });
        fetchPosts();
      } else {
        toast({
          title: "Error",
          description: (response && response.message) || "Failed to update post spicy level",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating post spicy level:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update post spicy level",
        variant: "destructive",
      });
    }
  };
  
  // Status badge color mapper
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500 hover:bg-amber-600";
      case "approved":
        return "bg-green-500 hover:bg-green-600";
      case "disapproved":
        return "bg-red-500 hover:bg-red-600";
      case "removed":
        return "bg-slate-500 hover:bg-slate-600";
      default:
        return "bg-secondary";
    }
  };
  
  // Add a function to delete a user
  const handleDeleteUserById = async (userId) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await api.deleteUser(userId);
      if (response.status === "success") {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };
  
  // Add a function to fix image loading if it fails
  const handleImageError = (e, fallbackUrl = "https://placehold.co/600x400?text=Image+Not+Available") => {
    console.error('Image failed to load:', e.currentTarget.src);
    e.currentTarget.src = fallbackUrl;
  };
  
  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen py-10 pt-20">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldAlert className="text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome, {user?.name}. Manage users and posts from this admin panel.
            </p>
          </div>
          
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="users" className="text-sm sm:text-base">
                User Management
              </TabsTrigger>
              <TabsTrigger value="posts" className="text-sm sm:text-base">
                Post Management
              </TabsTrigger>
            </TabsList>
            
            {/* User Management Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Manage user roles and accounts
                  </CardDescription>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button onClick={fetchUsers}>Refresh</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] w-full rounded-md custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingUsers ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                              <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
                            <TableRow key={user._id || user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={user.role === "admin" ? "bg-primary/20 text-primary" : ""}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <span className="sr-only">Role</span>
                                        <span className="flex items-center gap-1">
                                          Role <ChevronDown size={14} />
                                        </span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleUpdateUserRole(user._id || user.id, "user")}>
                                        <div className="flex items-center gap-2">
                                          <Shield size={14} />
                                          <span>User</span>
                                          {user.role === "user" && <Check size={14} className="ml-2" />}
                                        </div>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateUserRole(user._id || user.id, "admin")}>
                                        <div className="flex items-center gap-2">
                                          <ShieldAlert size={14} />
                                          <span>Admin</span>
                                          {user.role === "admin" && <Check size={14} className="ml-2" />}
                                        </div>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-destructive border-destructive/50 hover:bg-destructive/10"
                                    onClick={() => setDeleteUserDialog({ isOpen: true, userId: user._id || user.id })}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Post Management Tab */}
            <TabsContent value="posts">
              <Card>
                <CardHeader>
                  <CardTitle>Posts</CardTitle>
                  <CardDescription>
                    Manage posts, moderate content and adjust spicy levels
                  </CardDescription>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search posts..."
                        className="pl-8"
                        value={postSearchQuery}
                        onChange={(e) => setPostSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex gap-2 items-center">
                            <Filter size={14} />
                            <span>{postStatusFilter === "all" ? "All" : postStatusFilter}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPostStatusFilter("all")}>
                            All
                            {postStatusFilter === "all" && <Check size={14} className="ml-2" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPostStatusFilter("pending")}>
                            Pending
                            {postStatusFilter === "pending" && <Check size={14} className="ml-2" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPostStatusFilter("approved")}>
                            Approved
                            {postStatusFilter === "approved" && <Check size={14} className="ml-2" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPostStatusFilter("disapproved")}>
                            Disapproved
                            {postStatusFilter === "disapproved" && <Check size={14} className="ml-2" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPostStatusFilter("removed")}>
                            Removed
                            {postStatusFilter === "removed" && <Check size={14} className="ml-2" />}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button onClick={fetchPosts}>Refresh</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] w-full rounded-md custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Author</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Spicy Level</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingPosts ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : posts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No posts found
                            </TableCell>
                          </TableRow>
                        ) : (
                          posts.map((post) => (
                            <TableRow key={post.id || post._id}>
                              <TableCell className="font-medium">
                                {post.isAnonymous ? "Anonymous" : post.username || "Unknown"}
                              </TableCell>
                              <TableCell className="max-w-[250px] truncate">
                                {post.content}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={`${getStatusBadgeColor(post.status)} text-white font-medium`}
                                >
                                  {post.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Flame className="h-4 w-4 text-red-500" />
                                  <Select
                                    defaultValue={post.spicyLevel?.toString() || "1"}
                                    onValueChange={(value) => handleUpdatePostSpicyLevel(post.id || post._id, value)}
                                  >
                                    <SelectTrigger className="w-14 h-7">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1</SelectItem>
                                      <SelectItem value="2">2</SelectItem>
                                      <SelectItem value="3">3</SelectItem>
                                      <SelectItem value="4">4</SelectItem>
                                      <SelectItem value="5">5</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                              <TableCell>
                                {(post.imageUrl || post.image) ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex items-center gap-2"
                                    onClick={() => setSelectedPost(post)}
                                  >
                                    <Image size={14} />
                                    <span>View</span>
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No image</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                    onClick={() => handleUpdatePostStatus(post.id || post._id, "pending")}
                                  >
                                    <span className="sr-only">Mark as Pending</span>
                                    <AlertCircle size={14} />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-green-500 hover:text-green-600 hover:bg-green-50"
                                    onClick={() => handleUpdatePostStatus(post.id || post._id, "approved")}
                                  >
                                    <span className="sr-only">Approve</span>
                                    <Check size={14} />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleUpdatePostStatus(post.id || post._id, "disapproved")}
                                  >
                                    <span className="sr-only">Disapprove</span>
                                    <X size={14} />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-slate-500 hover:text-slate-600 hover:bg-slate-50"
                                    onClick={() => handleUpdatePostStatus(post.id || post._id, "removed")}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <Trash2 size={14} />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-primary hover:text-primary-foreground hover:bg-primary"
                                    onClick={() => setSelectedPost(post)}
                                  >
                                    <span className="sr-only">View Full Post</span>
                                    <Eye size={14} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
        
        {/* Delete User Confirmation Dialog */}
        <AlertDialog 
          open={deleteUserDialog.isOpen} 
          onOpenChange={(open) => !open && setDeleteUserDialog({ isOpen: false, userId: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Post Preview Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Post Details
                {selectedPost?.status && (
                  <Badge 
                    className={`${getStatusBadgeColor(selectedPost.status)} text-white font-medium ml-2`}
                  >
                    {selectedPost.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Review post content and make moderation decisions
              </DialogDescription>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                    {selectedPost.isAnonymous ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      selectedPost.username?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedPost.isAnonymous ? "Anonymous" : selectedPost.username || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedPost.timestamp || "Unknown date"}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Flame className="h-4 w-4 text-red-500" />
                    <span className="font-medium">
                      {selectedPost.spicyLevel || 1}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-secondary/10 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                </div>

                {(selectedPost.imageUrl || selectedPost.image) && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-border">
                    <div className="relative">
                      <img 
                        src={selectedPost.imageUrl || selectedPost.image} 
                        alt="Post content" 
                        className="w-full h-auto max-h-[500px] object-contain bg-secondary/20"
                        onError={handleImageError}
                      />
                      <div className="absolute top-2 right-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-sm"
                          onClick={() => window.open(selectedPost.imageUrl || selectedPost.image, '_blank')}
                        >
                          Open Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-6">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                    onClick={() => {
                      handleUpdatePostStatus(selectedPost.id || selectedPost._id, "pending");
                      setSelectedPost(null);
                    }}
                  >
                    <AlertCircle size={14} className="mr-2" />
                    Mark as Pending
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                    onClick={() => {
                      handleUpdatePostStatus(selectedPost.id || selectedPost._id, "approved");
                      setSelectedPost(null);
                    }}
                  >
                    <Check size={14} className="mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => {
                      handleUpdatePostStatus(selectedPost.id || selectedPost._id, "disapproved");
                      setSelectedPost(null);
                    }}
                  >
                    <X size={14} className="mr-2" />
                    Disapprove
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-slate-500 border-slate-500/30 hover:bg-slate-500/10"
                    onClick={() => {
                      handleUpdatePostStatus(selectedPost.id || selectedPost._id, "removed");
                      setSelectedPost(null);
                    }}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Remove
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="text-sm font-medium">Update Spicy Level:</div>
                  <Select
                    defaultValue={selectedPost.spicyLevel?.toString() || "1"}
                    onValueChange={(value) => {
                      handleUpdatePostSpicyLevel(selectedPost.id || selectedPost._id, value);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminPage; 