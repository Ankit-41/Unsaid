import React, { useState, useEffect } from "react";
import { usePostContext } from "@/context/PostContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Comment } from "@/utils/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Heart, Reply, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments }) => {
  const { addComment, addCommentReply, likeComment, unlikeComment } = usePostContext();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    // Debug log to see what comments data we're getting
    console.log("CommentSection received comments:", comments);
    comments.forEach(comment => {
      console.log(`Comment ${comment.id}:`, {
        content: comment.content,
        username: comment.username,
        likes: comment.likes,
        isLiked: comment.isLiked,
        replies: comment.replies ? comment.replies.length : 0
      });
      if (comment.replies && comment.replies.length > 0) {
        console.log(`Replies to comment ${comment.id}:`, comment.replies);
      }
    });
  }, [comments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      setIsSubmitting(true);
      try {
        await addComment(postId, commentText);
        setCommentText("");
      } catch (error) {
        console.error("Error submitting comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (replyText.trim() && replyingTo) {
      setIsSubmittingReply(true);
      try {
        console.log(`Submitting reply to comment ${commentId}:`, replyText);
        await addCommentReply(postId, commentId, replyText);
        setReplyText("");
        setReplyingTo(null);
      } catch (error) {
        console.error("Error submitting reply:", error);
      } finally {
        setIsSubmittingReply(false);
      }
    }
  };

  const handleToggleLike = (comment: Comment) => {
    console.log(`Toggling like for comment ${comment.id}. Current status: ${comment.isLiked ? 'liked' : 'not liked'}`);
    if (comment.isLiked) {
      unlikeComment(postId, comment.id);
    } else {
      likeComment(postId, comment.id);
    }
  };

  const startReply = (commentId: string) => {
    console.log(`Starting reply to comment ${commentId}`);
    setReplyingTo(commentId);
    setReplyText("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  // Render a single comment with any nested replies
  const renderComment = (comment: Comment, isReply = false) => {
    return (
      <div key={comment.id} className={cn(
        "p-3 rounded-lg border border-border/50",
        isReply ? "ml-6 mt-2 bg-secondary/10" : "bg-secondary/20"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
            {comment.username ? comment.username.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium">{comment.username || "Anonymous"}</h4>
            <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
          </div>
        </div>
        
        <p className="text-sm mb-3">{comment.content}</p>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleToggleLike(comment)}
            className={cn(
              "flex items-center gap-1 text-xs hover:text-primary transition-colors",
              comment.isLiked && "text-primary"
            )}
          >
            <Heart size={14} className={comment.isLiked ? "fill-primary" : ""} />
            <span>{comment.likes || 0}</span>
          </button>
          
          {!isReply && (
            <button 
              onClick={() => startReply(comment.id)}
              className="flex items-center gap-1 text-xs hover:text-primary transition-colors"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <form 
            onSubmit={(e) => handleSubmitReply(e, comment.id)} 
            className="mt-3 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Input
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="pr-16 text-sm focus-visible:ring-primary focus-visible:ring-offset-0"
                disabled={isSubmittingReply}
                autoFocus={false} // Prevent auto focus
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-secondary/80"
                  onClick={cancelReply}
                >
                  <X size={14} />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-primary hover:text-primary/80"
                  disabled={!replyText.trim() || isSubmittingReply}
                >
                  <Send size={14} className={isSubmittingReply ? "animate-pulse" : ""} />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Render replies if any */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-4">
      {comments.length > 0 && (
        <ScrollArea className="h-[400px] w-full custom-scrollbar pb-4">
          <div className="space-y-4">
            {comments.map(comment => renderComment(comment))}
          </div>
        </ScrollArea>
      )}

      <form onSubmit={handleSubmitComment} className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
        <div className="relative flex-1">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 pr-10 focus-visible:ring-primary focus-visible:ring-offset-0 border-secondary"
            disabled={isSubmitting}
            autoFocus={false} // Prevent auto focus on mobile
          />
          <Button 
            type="submit" 
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-primary hover:text-primary/80"
            disabled={!commentText.trim() || isSubmitting}
          >
            <Send size={16} className={isSubmitting ? "animate-pulse" : ""} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
