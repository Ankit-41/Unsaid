import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '../../atoms/authAtom';
import { Post } from '../../atoms/postAtom';
import { postsAPI } from '../../services/api';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import CommentItem from './CommentItem';
import { ThumbsUp, MessageCircle, AlertCircle } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onUpdate?: (updatedPost: Post) => void;
  showAdminControls?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onUpdate, 
  showAdminControls = false 
}) => {
  const [auth] = useAtom(authAtom);
  const [isLiked, setIsLiked] = useState(post.likes.includes(auth.user?._id || ''));
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await postsAPI.unlikePost(post._id);
        setLikeCount(prev => prev - 1);
      } else {
        await postsAPI.likePost(post._id);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Like toggle error:', error);
      toast.error('Failed to update like status');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await postsAPI.addComment(post._id, { text: commentText });
      setComments([...comments, response.data.data.comment]);
      setCommentText('');
      toast.success('Comment added successfully');
      
      // Update post if callback provided
      if (onUpdate && response.data.data.post) {
        onUpdate(response.data.data.post);
      }
    } catch (error) {
      console.error('Comment submission error:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle post status update (admin only)
  const handleStatusUpdate = async (newStatus: 'approved' | 'disapproved' | 'removed') => {
    try {
      const response = await postsAPI.updatePostStatus(post._id, { status: newStatus });
      toast.success(`Post ${newStatus} successfully`);
      
      // Update post if callback provided
      if (onUpdate && response.data.data.post) {
        onUpdate(response.data.data.post);
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update post status');
    }
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="bg-gray-50 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{post.author.name}</h3>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
          
          {showAdminControls && post.status === 'pending' && (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => handleStatusUpdate('approved')}
              >
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleStatusUpdate('disapproved')}
              >
                Disapprove
              </Button>
            </div>
          )}
          
          {showAdminControls && post.status === 'approved' && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => handleStatusUpdate('removed')}
            >
              Remove
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <p className="whitespace-pre-line">{post.content}</p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col">
        <div className="flex items-center justify-between w-full border-t pt-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={isLiked ? "text-primary" : "text-gray-500"}
              onClick={handleLikeToggle}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${isLiked ? "fill-primary" : ""}`} /> {likeCount}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4 mr-1" /> {comments.length}
            </Button>
          </div>
          
          {post.status === 'pending' && !showAdminControls && (
            <div className="flex items-center text-yellow-500 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" /> Pending approval
            </div>
          )}
          
          {post.status === 'disapproved' && !showAdminControls && (
            <div className="flex items-center text-red-500 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" /> Disapproved
            </div>
          )}
        </div>
        
        {showComments && (
          <div className="w-full mt-4">
            <div className="mb-4">
              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map(comment => (
                    <CommentItem key={comment._id} comment={comment} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">No comments yet</p>
              )}
            </div>
            
            <form onSubmit={handleCommentSubmit} className="flex space-x-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-[60px] resize-none"
              />
              <Button 
                type="submit" 
                disabled={!commentText.trim() || isSubmitting}
                className="self-end"
              >
                {isSubmitting ? '...' : 'Post'}
              </Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
