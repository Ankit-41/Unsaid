"use client"

import { useState, useEffect } from "react"
import { FaHeart, FaRegHeart, FaComment, FaShare, FaTimes, FaPaperPlane, FaPepperHot, FaFire } from "react-icons/fa"
import { postsAPI } from "../../services/api"
import toast from "react-hot-toast"

// Add this to your global CSS or component
const postStyles = `
@keyframes heatPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 61, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0); }
}

.heat-pulse {
  animation: heatPulse 2s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes spicyShake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
}

.spicy-shake:hover {
  animation: spicyShake 0.5s ease-in-out;
}

.spicy-gradient {
  background: linear-gradient(135deg, #b71c1c, #ff3d00);
}

.post-card {
  max-width: 500px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.post-content-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.post-content {
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  line-height: 1.4;
  padding: 1rem;
  overflow-y: auto;
  word-break: break-word;
  max-height: 100%;
  height: 100%;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 61, 0, 0.2);
  background-color: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(4px);
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9CA3AF;
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 8px;
}

.action-button:active {
  background-color: rgba(255, 61, 0, 0.1);
  transform: scale(0.95);
}

.action-button .count {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.comment-modal {
  width: 100%;
  max-width: 450px;
  max-height: 85vh;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.comment-list {
  max-height: 50vh;
  overflow-y: auto;
}

.comment-item {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 61, 0, 0.5);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 61, 0, 0.7);
}

@media (min-width: 768px) {
  .post-card {
    max-width: 450px;
  }
  
  .comment-modal {
    width: 90%;
  }
}

@media (max-height: 700px) {
  .comment-list {
    max-height: 40vh;
  }
}

@media (max-height: 600px) {
  .comment-list {
    max-height: 35vh;
  }
}
`

function Post({ post, isActive }) {
  // Set initial liked state based on an already-liked error flag
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [alreadyLikedError, setAlreadyLikedError] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState(post.comments || [])
  const [spicyLevel, setSpicyLevel] = useState(0)

  useEffect(() => {
    // Set the correct like count when post changes
    setLikeCount(Array.isArray(post.likes) ? post.likes.length : 0)

    // Calculate spicy level based on content length or engagement
    const contentLength = post.content.length
    let level = 1
    if (contentLength > 400) level = 5
    else if (contentLength > 300) level = 4
    else if (contentLength > 200) level = 3
    else if (contentLength > 100) level = 2
    setSpicyLevel(level)

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
    if (currentUser && currentUser._id) {
      const userHasLiked =
        Array.isArray(post.likes) &&
        post.likes.some((like) => {
          if (typeof like === "string") {
            return String(like) === String(currentUser._id)
          } else if (like && typeof like === "object" && like._id) {
            return String(like._id) === String(currentUser._id)
          }
          return false
        })
      setLiked(userHasLiked)
    }
  }, [post])

  const toggleLike = async () => {
    try {
      if (!liked && !alreadyLikedError) {
        // Like the post
        const response = await postsAPI.likePost(post._id)

        // Handle success
        toast.success("You're feeling the heat! 🔥", {
          icon: "🌶️",
          style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
        })
        setLiked(true)
        setLikeCount((prev) => prev + 1)
      } else {
        // Unlike the post
        const response = await postsAPI.unlikePost(post._id)

        // Update state
        setLiked(false)
        setAlreadyLikedError(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
        toast.success("Cooled down a bit!", {
          icon: "❄️",
          style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
        })
      }
    } catch (error) {
      console.error(`Error toggling like:`, error)

      // If it's an "already liked" error, use this to our advantage
      if (error.response?.data?.message?.includes("already liked")) {
        toast.error(error.response.data.message, {
          icon: "🔥",
          style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
        })
        setLiked(true)
        setAlreadyLikedError(true)
      } else {
        toast.error(error.response?.data?.message || "Failed to update like. Please try again.", {
          icon: "💔",
          style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
        })
      }
    }
  }

  const openComments = () => {
    if (isActive) {
      setShowCommentModal(true)
    }
  }

  const closeComments = () => {
    setShowCommentModal(false)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      const response = await postsAPI.addComment(post._id, { text: commentText })
      const newComment = response.data.data.comment
      setComments([...comments, newComment])
      setCommentText("")
      toast.success("Your spicy comment has been added! 🌶️", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error(error.response?.data?.message || "Failed to add comment. Please try again.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    }
  }

  return (
    <>
      <style>{postStyles}</style>
      <div className="max-h-[calc(100vh-150px)] post-card bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Header */}
        <div className="p-3 border-b border-gray-800 bg-gray-900 bg-opacity-80">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center spicy-gradient text-white mr-3">
              {post.isAnonymous ? <FaFire className="text-white" /> : post.author.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h6 className="text-base font-semibold text-white flex items-center truncate">
                {post.isAnonymous ? "Anonymous" : post.author.name}
                {post.isAnonymous && (
                  <span className="ml-2 text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Incognito
                  </span>
                )}
              </h6>
              <small className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleString()}</small>
            </div>

            {/* Spicy Level Indicator */}
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaPepperHot
                    key={i}
                    size={i < spicyLevel ? 14 : 12}
                    className={`${i < spicyLevel ? "text-red-500" : "text-gray-600"} ${
                      i === spicyLevel - 1 ? "heat-pulse" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Post Content - Now in a wrapper with fixed height */}
        <div className="post-content-wrapper bg-gray-800 bg-opacity-90" style={{ height: "calc(100% - 140px)" }}>
          <div className="post-content text-white spicy-shake custom-scrollbar">
            {post.content}
          </div>
        </div>

        {/* Interactive Controls - Now fixed at the bottom */}
        <div className={`post-actions sticky bottom-0 ${isActive ? "" : "opacity-50 pointer-events-none"}`}>
          <button
            className="action-button"
            onClick={toggleLike}
            disabled={!isActive}
            aria-label={liked ? "Unlike post" : "Like post"}
          >
            {liked ? <FaHeart className="text-xl text-red-500 heat-pulse" /> : <FaRegHeart className="text-xl" />}
            <span className="count" style={{ color: liked || alreadyLikedError ? "#FF3D00" : "inherit" }}>
              {likeCount}
            </span>
          </button>

          <button className="action-button" onClick={openComments} disabled={!isActive} aria-label="View comments">
            <FaComment className="text-xl" />
            <span className="count">{comments.length}</span>
          </button>

          <button className="action-button" disabled={!isActive} aria-label="Share post">
            <FaShare className="text-xl" />
            <span className="count">Share</span>
          </button>
        </div>

        {/* Comment Modal Popup - Improved for mobile */}
        {showCommentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-2">
            <div className="comment-modal bg-gray-900 animate-fadeIn">
              {/* Compact header */}
              <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gradient-to-r from-red-900 to-red-700">
                <h2 className="text-sm font-bold text-white flex items-center">
                  <FaFire className="mr-1 text-yellow-400" />
                  <span>Comments</span>
                  <span className="ml-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                </h2>
                <button
                  onClick={closeComments}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-white hover:bg-red-900/50 transition-colors"
                  aria-label="Close comments"
                >
                  <FaTimes size={12} />
                </button>
              </div>

              {/* Comment list with improved scrolling */}
              <div className="comment-list p-2 bg-gray-800 custom-scrollbar">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <div className="flex items-start space-x-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center spicy-gradient text-white flex-shrink-0">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <h6 className="font-semibold text-white text-xs truncate">{comment.user.name}</h6>
                            <small className="text-gray-400 text-xs ml-1 whitespace-nowrap">
                              {new Date(comment.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </div>
                          <p className="text-gray-300 text-xs break-words">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                    <FaPepperHot className="text-2xl mb-2 text-red-500 opacity-30" />
                    <p className="text-xs">No spicy comments yet. Add some heat!</p>
                  </div>
                )}
              </div>

              {/* Comment input - Compact and mobile friendly */}
              <div className="p-2 border-t border-gray-800 bg-gray-800">
                <form onSubmit={handleCommentSubmit} className="flex">
                  <input
                    type="text"
                    className="flex-grow p-2 border border-gray-700 rounded-l-lg bg-gray-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-gray-400"
                    placeholder="Add your spicy take..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-3 spicy-gradient text-white rounded-r-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                    disabled={!commentText.trim()}
                    aria-label="Submit comment"
                  >
                    <FaPaperPlane size={14} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Post
