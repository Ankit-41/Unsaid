import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Comment } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePostContext } from "@/context/PostContext";
import CommentSection from "./CommentSection";

interface CommentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  comments: Comment[];
}

const CommentsDialog: React.FC<CommentsDialogProps> = ({
  isOpen,
  onClose,
  postId,
  comments,
}) => {
  const { addComment } = usePostContext();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Debug the comments passed to the dialog
    if (isOpen) {
      console.log("CommentsDialog opened with comments:", comments);
      console.log("CommentsDialog comments structure:", {
        count: comments.length,
        hasReplies: comments.some(c => c.replies && c.replies.length > 0),
        hasLikes: comments.some(c => c.likes && c.likes > 0)
      });
    }
  }, [isOpen, comments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(postId, commentText);
      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 mt-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <CommentSection comments={comments} postId={postId} />
          )}
        </div>
        
        <form 
          onSubmit={handleSubmitComment} 
          className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4"
        >
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1"
            disabled={isSubmitting}
            autoFocus={false}
          />
          <Button 
            type="submit"
            size="sm"
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? "..." : "Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsDialog;
