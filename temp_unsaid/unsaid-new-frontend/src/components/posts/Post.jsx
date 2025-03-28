"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Share, Send, ChefHat, Flame, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Global Styles for Custom Scrollbar
const globalStyles = `
  /* Custom Scrollbar Styles */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-track-gray-800::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 0.5rem;
  }

  .scrollbar-thumb-gray-700::-webkit-scrollbar-thumb {
    background-color: rgba(55, 65, 81, 0.7);
    border-radius: 0.5rem;
    transition: background-color 0.3s ease;
  }

  .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb:hover {
    background-color: rgba(75, 85, 99, 0.8);
  }
`

function Post({ post, isActive = true }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState(post?.comments || [])
  const [spicyLevel, setSpicyLevel] = useState(post?.spicyLevel || 1)

  useEffect(() => {
    // Add global styles to the document
    const styleTag = document.createElement("style")
    styleTag.textContent = globalStyles
    document.head.appendChild(styleTag)

    // Initialize like count and spicy level
    setLikeCount(Array.isArray(post?.likes) ? post.likes.length : 0)
    if (post?.spicyLevel) setSpicyLevel(post.spicyLevel)

    // Check if current user has liked the post
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
    if (currentUser && currentUser._id && Array.isArray(post?.likes)) {
      const userHasLiked = post.likes.some((like) => {
        if (typeof like === "string") return String(like) === String(currentUser._id)
        if (like && typeof like === "object" && like._id) return String(like._id) === String(currentUser._id)
        return false
      })
      setLiked(userHasLiked)
    }
  }, [post])

  const toggleLike = async () => {
    try {
      if (!liked) {
        setLiked(true)
        setLikeCount((prev) => prev + 1)
      } else {
        setLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      const newComment = {
        _id: Date.now().toString(),
        text: commentText,
        user: { name: "Current User" },
        createdAt: new Date().toISOString(),
      }
      setComments([...comments, newComment])
      setCommentText("")
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Compact Header */}
      <div className="px-3 py-2 flex justify-between items-center border-b border-gray-700 bg-gray-900">
        <div className="flex items-center space-x-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>
              {post?.isAnonymous ? (
                <Flame className="text-white" size={18} />
              ) : (
                <User className="text-white" size={18} />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <h6 className="text-white font-semibold">{post?.isAnonymous ? "Anonymous" : post?.author?.name}</h6>
            <p className="text-gray-400 text-xs">
              {post?.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now"}
            </p>
          </div>
        </div>
        {/* Spicy Meter */}
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <ChefHat
              key={i}
              size={i < spicyLevel ? 16 : 14}
              className={`${i < spicyLevel ? "text-red-500" : "text-gray-600"} ${i === spicyLevel - 1 ? "animate-pulse" : ""
                }`}
            />
          ))}
        </div>
      </div>

      {/* Centered Post Content */}
      <div className="px-4 py-6 flex items-center justify-center" style={{ minHeight: "120px" }}>
        <p className="text-white text-base text-center leading-relaxed">
          {post?.content || "This is a sample post content. Share your thoughts anonymously!"}
        </p>
      </div>

      {/* Footer Controls */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-900 flex justify-start items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLike}
          disabled={!isActive}
          className="flex items-center text-gray-400 hover:text-red-400"
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
          <span className="text-xs ml-1">{likeCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCommentModal(true)}
          disabled={!isActive}
          className="flex items-center text-gray-400 hover:text-blue-400"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs ml-1">{comments.length}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!isActive}
          className="flex items-center text-gray-400 hover:text-green-400"
        >
          <Share className="w-5 h-5" />
        </Button>
      </div>

      {/* Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent
         onOpenAutoFocus={(e) => e.preventDefault()}
          className="bg-gray-900 text-white max-w-md rounded-lg 
    border-0 outline-none ring-0 
    [&>*]:border-none [&>*]:outline-none 
    flex flex-col p-0 pt-3"
          style={{
            border: "none !important",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.2)",
            maxHeight: "50vh",
            transform: "translateY(-25%)",

          }}
        >
          <DialogHeader className="px-4 py-1 h-6">
            <DialogTitle className="flex items-center text-sm font-semibold leading-tight m-0 p-0">
              <Flame className="mr-2 text-red-500" size={14} />
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Comments
              </span>
              <Badge variant="outline" className="ml-2 bg-gray-800 text-white border-gray-700">
                {comments.length}
              </Badge>
            </DialogTitle>
          </DialogHeader>


          {/* Comment List with Custom Scrollbar - Takes available space */}
          <div
            className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 mb-14
            custom-scrollbar scrollbar-thin scrollbar-track-gray-800 
            scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600"
          >
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 rounded-md p-2
                  transition-colors duration-200 
                  hover:bg-gray-800/50"
                >
                  <div className="flex items-start space-x-2">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback>
                        {comment.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <h6 className="font-semibold text-white text-xs truncate">{comment.user.name}</h6>
                        <p className="text-gray-400 text-xs ml-1 whitespace-nowrap">
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p className="text-gray-300 text-xs mt-0.5 break-words">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <MessageCircle className="mx-auto mb-2 opacity-50" size={24} />
                <p className="text-sm">No comments yet. Be the first!</p>
              </div>
            )}
          </div>

          {/* Fixed Comment Input at bottom */}
          <div
            className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2.5 w-full"
            style={{ maxWidth: "inherit", borderBottomLeftRadius: "0.5rem", borderBottomRightRadius: "0.5rem" }}
          >
            <form onSubmit={handleCommentSubmit} className="flex">
              <Input
                className="flex-grow bg-gray-800 border-gray-700 text-white text-sm
                focus-visible:ring-red-500 focus-visible:border-transparent"
                placeholder="Add your spicy take..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                autoFocus
              />
              <Button
                type="submit"
                className="ml-2 bg-gradient-to-r from-red-600 to-orange-600 
                hover:from-red-700 hover:to-orange-700"
                disabled={!commentText.trim()}
              >
                <Send size={16} />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Post
