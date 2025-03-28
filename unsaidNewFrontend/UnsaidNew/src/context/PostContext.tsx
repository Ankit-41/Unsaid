import React, { createContext, useContext, useState, useEffect } from "react";
import { Post, Comment } from "@/utils/types";
import { toast } from "@/hooks/use-toast";
import * as api from '@/services/api';
import { useAuth } from "@/context/AuthContext";

interface PostContextType {
  posts: Post[];
  loading: boolean;
  addPost: (post: NewPostData) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, comment: string) => Promise<void>;
  addCommentReply: (postId: string, commentId: string, replyText: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => Promise<void>;
  unlikeComment: (postId: string, commentId: string) => Promise<void>;
  sharePost: (postId: string) => void;
  fetchMorePosts: () => Promise<void>;
  currentPage: number;
  totalPages: number;
}

interface NewPostData {
  content: string;
  image?: File | null;
  spicyLevel?: number;
  isAnonymous?: boolean;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    } else {
      // Clear posts when user logs out
      setPosts([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [isAuthenticated]);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getPosts(page);
      
      if (response.status === 'success') {
        console.log("Received posts from API:", response.data.posts);
        
        // Map the API data to the frontend Post format
        const fetchedPosts = response.data.posts.map((post: any) => {
          // Process comments to maintain the nested structure
          const processedComments = post.comments.map((comment: any) => {
            // Check if this comment has replies
            return {
              id: comment._id,
              username: comment.user?.name || 'Unknown',
              content: comment.text,
              timestamp: new Date(comment.createdAt).toLocaleString(),
              likes: comment.likes ? comment.likes.length : 0,
              isLiked: comment.isLiked || false,
              // Include replies array if it exists
              replies: comment.replies ? comment.replies.map((reply: any) => ({
                id: reply._id,
                username: reply.user?.name || 'Unknown',
                content: reply.text,
                timestamp: new Date(reply.createdAt).toLocaleString(),
                parentId: reply.parentId,
                likes: reply.likes ? reply.likes.length : 0,
                isLiked: reply.isLiked || false
              })) : []
            };
          });
          
          return {
            id: post._id,
            username: post.isAnonymous ? 'Anonymous' : post.author?.name,
            content: post.content,
            imageUrl: post.image,
            timestamp: new Date(post.createdAt).toLocaleString(),
            likes: post.likes.length,
            isLiked: post.likes.includes(localStorage.getItem('userId')),
            comments: processedComments,
            spicyLevel: post.spicyLevel,
            isAnonymous: post.isAnonymous
          };
        });

        console.log("Processed posts with comments:", fetchedPosts);
        setPosts(page === 1 ? fetchedPosts : [...posts, ...fetchedPosts]);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
      } else {
        toast({
          title: "Error fetching posts",
          description: response.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error fetching posts",
        description: "Failed to load posts. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMorePosts = async () => {
    if (currentPage < totalPages) {
      await fetchPosts(currentPage + 1);
    }
  };

  const addPost = async (newPostData: NewPostData) => {
    try {
      setLoading(true);
      
      const apiPostData = {
        content: newPostData.content,
        spicyLevel: newPostData.spicyLevel || 3,
        isAnonymous: newPostData.isAnonymous || false,
        image: newPostData.image
      };
      
      const response = await api.createPost(apiPostData);
      
      if (response.status === 'success') {
        // Since the post is in "pending" state, we don't add it to the UI
        // Instead, show a message about pending approval
        toast({
          title: "Post created",
          description: "Your post has been submitted and is pending approval",
        });
        
        // Optionally refresh posts to show in "My Posts" if that feature exists
        fetchPosts();
      } else {
        toast({
          title: "Error creating post",
          description: response.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error creating post",
        description: "Failed to create post. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId && !post.isLiked) {
            return {
              ...post,
              likes: post.likes + 1,
              isLiked: true,
            };
          }
          return post;
        })
      );
      
      const response = await api.likePost(postId);
      
      if (response.status !== 'success') {
        // Revert if fail
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likes: post.likes - 1,
                isLiked: false,
              };
            }
            return post;
          })
        );
        
        toast({
          title: "Error liking post",
          description: response.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert on error
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes: post.likes - 1,
              isLiked: false,
            };
          }
          return post;
        })
      );
      
      toast({
        title: "Error liking post",
        description: "Failed to like post. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const unlikePost = async (postId: string) => {
    try {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId && post.isLiked) {
            return {
              ...post,
              likes: post.likes - 1,
              isLiked: false,
            };
          }
          return post;
        })
      );
      
      const response = await api.unlikePost(postId);
      
      if (response.status !== 'success') {
        // Revert if fail
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likes: post.likes + 1,
                isLiked: true,
              };
            }
            return post;
          })
        );
        
        toast({
          title: "Error unliking post",
          description: response.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error unliking post:", error);
      // Revert on error
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes: post.likes + 1,
              isLiked: true,
            };
          }
          return post;
        })
      );
      
      toast({
        title: "Error unliking post",
        description: "Failed to unlike post. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const addComment = async (postId: string, commentText: string) => {
    if (!commentText.trim()) return;
    
    try {
      const response = await api.addComment(postId, commentText);
      
      if (response.status === 'success') {
        console.log("Add comment response:", response.data);
        
        // Update local state with new comment
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              const newComment: Comment = {
                id: response.data.comment._id,
                username: response.data.comment.user.name,
                content: response.data.comment.text,
                timestamp: new Date(response.data.comment.createdAt).toLocaleString(),
                likes: 0,
                isLiked: false,
                replies: [] // Initialize empty replies array
              };
              
              return {
                ...post,
                comments: [...post.comments, newComment],
              };
            }
            return post;
          })
        );
      } else {
        toast({
          title: "Error adding comment",
          description: response.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error adding comment",
        description: "Failed to add comment. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const addCommentReply = async (postId: string, commentId: string, replyText: string) => {
    if (!replyText.trim()) return;
    
    try {
      console.log(`Adding reply to comment ${commentId} on post ${postId}`);
      const response = await api.addCommentReply(postId, commentId, replyText);
      
      if (response.status === 'success') {
        console.log("Reply added successfully:", response.data);
        
        // Update local state with new reply
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              // Create new comments array with updated replies
              const updatedComments = post.comments.map(comment => {
                if (comment.id === commentId) {
                  // Add the new reply to this comment
                  const newReply: Comment = {
                    id: response.data.reply._id,
                    username: response.data.reply.user.name,
                    content: response.data.reply.text,
                    timestamp: new Date(response.data.reply.createdAt).toLocaleString(),
                    parentId: commentId,
                    likes: 0,
                    isLiked: false,
                    replies: [] // Initialize empty replies array for consistency
                  };
                  
                  console.log(`Adding new reply to comment ${commentId}:`, newReply);
                  
                  // Add to replies array or create one if it doesn't exist
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newReply]
                  };
                }
                return comment;
              });
              
              return {
                ...post,
                comments: updatedComments
              };
            }
            return post;
          })
        );
      } else {
        toast({
          title: "Error adding reply",
          description: response.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error adding reply",
        description: "Failed to add reply. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const likeComment = async (postId: string, commentId: string) => {
    try {
      console.log(`Liking comment ${commentId} on post ${postId}`);
      
      // Find the comment (could be a top-level comment or a reply)
      const findAndUpdateComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          // If this is the comment we're looking for
          if (comment.id === commentId) {
            console.log(`Found comment to like: ${comment.id}`);
            return {
              ...comment,
              likes: comment.likes + 1,
              isLiked: true
            };
          }
          
          // If this comment has replies, search through them too
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = findAndUpdateComment(comment.replies);
            if (JSON.stringify(updatedReplies) !== JSON.stringify(comment.replies)) {
              console.log(`Found reply to like in comment ${comment.id}`);
              return {
                ...comment,
                replies: updatedReplies
              };
            }
          }
          
          return comment;
        });
      };
      
      // Update posts state with optimistic update
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const updatedComments = findAndUpdateComment(post.comments);
            console.log("Updated comments after like:", updatedComments);
            return {
              ...post,
              comments: updatedComments
            };
          }
          return post;
        })
      );
      
      const response = await api.likeComment(postId, commentId);
      console.log("Like comment response:", response);
      
      if (response.status !== 'success') {
        // Revert if fails - similar logic but decrementing like count
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const revertLike = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                  if (comment.id === commentId) {
                    return {
                      ...comment,
                      likes: comment.likes - 1,
                      isLiked: false
                    };
                  }
                  
                  if (comment.replies && comment.replies.length > 0) {
                    return {
                      ...comment,
                      replies: revertLike(comment.replies)
                    };
                  }
                  
                  return comment;
                });
              };
              
              return {
                ...post,
                comments: revertLike(post.comments)
              };
            }
            return post;
          })
        );
        
        toast({
          title: "Error liking comment",
          description: response.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      toast({
        title: "Error liking comment",
        description: "Failed to like comment. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const unlikeComment = async (postId: string, commentId: string) => {
    try {
      console.log(`Unliking comment ${commentId} on post ${postId}`);
      
      // Find the comment (could be a top-level comment or a reply)
      const findAndUpdateComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          // If this is the comment we're looking for
          if (comment.id === commentId) {
            console.log(`Found comment to unlike: ${comment.id}`);
            return {
              ...comment,
              likes: comment.likes - 1,
              isLiked: false
            };
          }
          
          // If this comment has replies, search through them too
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = findAndUpdateComment(comment.replies);
            if (JSON.stringify(updatedReplies) !== JSON.stringify(comment.replies)) {
              console.log(`Found reply to unlike in comment ${comment.id}`);
              return {
                ...comment,
                replies: updatedReplies
              };
            }
          }
          
          return comment;
        });
      };
      
      // Update posts state with optimistic update
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const updatedComments = findAndUpdateComment(post.comments);
            console.log("Updated comments after unlike:", updatedComments);
            return {
              ...post,
              comments: updatedComments
            };
          }
          return post;
        })
      );
      
      const response = await api.unlikeComment(postId, commentId);
      console.log("Unlike comment response:", response);
      
      if (response.status !== 'success') {
        // Revert if fails - similar logic but incrementing like count
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const revertUnlike = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                  if (comment.id === commentId) {
                    return {
                      ...comment,
                      likes: comment.likes + 1,
                      isLiked: true
                    };
                  }
                  
                  if (comment.replies && comment.replies.length > 0) {
                    return {
                      ...comment,
                      replies: revertUnlike(comment.replies)
                    };
                  }
                  
                  return comment;
                });
              };
              
              return {
                ...post,
                comments: revertUnlike(post.comments)
              };
            }
            return post;
          })
        );
        
        toast({
          title: "Error unliking comment",
          description: response.message || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error unliking comment:", error);
      toast({
        title: "Error unliking comment",
        description: "Failed to unlike comment. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const sharePost = (postId: string) => {
    // In a real app, this would open a share dialog or copy a link
    toast({
      title: "Post shared",
      description: "Link copied to clipboard",
    });
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        addPost,
        likePost,
        unlikePost,
        addComment,
        addCommentReply,
        likeComment,
        unlikeComment,
        sharePost,
        fetchMorePosts,
        currentPage,
        totalPages
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};
