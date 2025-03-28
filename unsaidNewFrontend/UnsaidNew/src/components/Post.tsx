import React, { useState, useEffect } from "react";
import { Heart, MessageSquare, Share2, Link2, Copy, CheckCheck } from "lucide-react";
import { usePostContext } from "@/context/PostContext";
import { Post as PostType } from "@/utils/types";
import { cn } from "@/lib/utils";
import CommentsDialog from "./CommentsDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const { likePost, unlikePost, sharePost, addComment } = usePostContext();
  const [commentText, setCommentText] = useState("");
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Log post data including comments when post changes
  useEffect(() => {
    console.log("Post component received post:", post.id);
    console.log("Post comments:", post.comments);
    // Log if comments have replies or likes
    if (post.comments && post.comments.length > 0) {
      const commentsWithReplies = post.comments.filter(c => c.replies && c.replies.length > 0);
      const commentsWithLikes = post.comments.filter(c => c.likes && c.likes > 0);
      console.log(`Comments with replies: ${commentsWithReplies.length}`);
      console.log(`Comments with likes: ${commentsWithLikes.length}`);
    }
  }, [post]);

  const handleLike = async () => {
    if (post.isLiked) {
      await unlikePost(post.id);
    } else {
      await likePost(post.id);
    }
  };

  const handleShare = () => {
    sharePost(post.id);
  };

  const handleCopyLink = async () => {
    try {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/post/${post.id}`;
      
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Post link has been copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying link:", error);
      toast({
        title: "Oops!",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShareToSocial = (platform: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/post/${post.id}`;
    
    switch (platform) {
      case "whatsapp":
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
      default:
        break;
    }
  };

  const handleOpenComments = () => {
    setShowCommentsDialog(true);
  };

  const handleCloseComments = () => {
    setShowCommentsDialog(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      setIsSubmittingComment(true);
      try {
        await addComment(post.id, commentText);
        setCommentText("");
        // Open the comments dialog after adding a comment
        setShowCommentsDialog(true);
      } catch (error) {
        console.error("Error submitting comment:", error);
      } finally {
        setIsSubmittingComment(false);
      }
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <>
      <article className="rounded-xl glass-card overflow-hidden animate-scale-in mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
              {post.username ? post.username.charAt(0).toUpperCase() : ""}
            </div>

            <div>
              <h3 className="font-medium">{post.username}</h3>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
            {post.spicyLevel && (
              <div className="ml-auto flex items-center">
                <span className="text-xs text-muted-foreground mr-1">Spicy:</span>
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-full mx-0.5",
                        i < post.spicyLevel ? "bg-red-500" : "bg-secondary"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-fade-in">{post.content}</p>

            {post.imageUrl && (
              <div className="relative w-full rounded-md overflow-hidden flex justify-center">
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className={cn(
                    "max-w-full max-h-[calc(100vh-300px)] object-contain",
                    imageLoaded ? "loaded" : "loading"
                  )}
                  onLoad={handleImageLoad}
                  onError={(e) => {
                    console.error('Image failed to load:', post.imageUrl);
                    setImageLoaded(true); // Stop showing loading indicator
                    // Add a small message about the broken image
                    e.currentTarget.parentElement?.classList.add('bg-red-50');
                    e.currentTarget.style.display = 'none';
                    // Add errorText element to show error
                    const errorText = document.createElement('div');
                    errorText.className = 'p-4 text-red-500 text-center';
                    errorText.textContent = 'Image could not be loaded';
                    e.currentTarget.parentElement?.appendChild(errorText);
                  }}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center">
                    <span className="text-muted-foreground">Loading image...</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors button-interaction"
                >
                  <Heart
                    size={18}
                    className={post.isLiked ? "fill-primary text-primary" : ""}
                  />
                  <span className="text-sm">{post.likes}</span>
                </button>

                <button
                  onClick={handleOpenComments}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors button-interaction"
                >
                  <MessageSquare size={18} />
                  <span className="text-sm">{post.comments.length}</span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-1.5 hover:text-primary transition-colors button-interaction"
                    >
                      <Share2 size={18} />
                      <span className="text-sm">Share</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer hover:bg-secondary/50">
                      <div className="flex items-center gap-2">
                        {linkCopied ? <CheckCheck size={16} /> : <Copy size={16} />}
                        <span>Copy link</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareToSocial('whatsapp')} className="cursor-pointer hover:bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span>WhatsApp</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareToSocial('twitter')} className="cursor-pointer hover:bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        <span>Twitter</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareToSocial('facebook')} className="cursor-pointer hover:bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>Facebook</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareToSocial('linkedin')} className="cursor-pointer hover:bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span>LinkedIn</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-border/50 pt-4">
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 focus-visible:ring-primary focus-visible:ring-offset-0 border-secondary"
              disabled={isSubmittingComment}
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="button-interaction"
              disabled={!commentText.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? "..." : "Post"}
            </Button>
          </form>
        </div>
      </article>

      <CommentsDialog
        isOpen={showCommentsDialog}
        onClose={handleCloseComments}
        postId={post.id}
        comments={post.comments}
      />
    </>
  );
};

export default Post;
