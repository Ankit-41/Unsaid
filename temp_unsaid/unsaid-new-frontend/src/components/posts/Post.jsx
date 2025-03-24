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

.spicy-bg {
  // background-color: #1a1a1a;
  // background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zM15 40c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5z' fill='%23ff3d00' fillOpacity='0.05' fillRule='evenodd'/%3E%3C/svg%3E");
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
      <div className="flex flex-col h-full spicy-bg relative">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900 shadow-md">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center spicy-gradient text-white mr-4 shadow-md">
              {post.isAnonymous ? <FaFire className="text-white" /> : post.author.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h6 className="text-lg font-semibold text-white flex items-center">
                {post.isAnonymous ? "Anonymous" : post.author.name}
                {post.isAnonymous && (
                  <span className="ml-2 text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded-full">
                    Incognito Gossiper
                  </span>
                )}
              </h6>
              <small className="text-gray-400">{new Date(post.createdAt).toLocaleString()}</small>
            </div>

            {/* Spicy Level Indicator */}
            <div className="ml-auto flex items-center">
              <span className="text-gray-400 text-sm mr-2">Spicy:</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaPepperHot
                    key={i}
                    className={`${i < spicyLevel ? "text-red-500" : "text-gray-600"} ${
                      i === spicyLevel - 1 ? "heat-pulse" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="flex-grow p-8 flex items-center justify-center overflow-auto">
          <div className="text-3xl md:text-4xl text-center font-medium text-white max-w-2xl mx-auto px-4 spicy-shake">
            {post.content}
          </div>
        </div>

        {/* Interactive Controls – visible only if active */}
        <div
          className={`p-3 mb-20 pt-3 pb-3 border-t border-gray-800 bg-gray-900 shadow-md transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex justify-between items-center max-w-md mx-auto">
            <button
              className="flex items-center space-x-2 py-2 px-4 rounded-full transition-colors hover:bg-red-900/30"
              onClick={toggleLike}
              disabled={!isActive}
            >
              {/* Show red heart if liked OR if we got an "already liked" error */}
              {liked ? (
                <FaHeart className="text-xl text-red-500 heat-pulse" />
              ) : (
                <FaRegHeart className="text-xl text-gray-400" />
              )}

              <span className="font-medium" style={{ color: liked || alreadyLikedError ? "#FF3D00" : "#9CA3AF" }}>
                {likeCount}
              </span>
            </button>

            <button
              className="flex items-center space-x-2 py-2 px-4 rounded-full text-gray-400 hover:bg-red-900/30 transition-colors"
              onClick={openComments}
              disabled={!isActive}
            >
              <FaComment className="text-xl" />
              <span className="font-medium">{comments.length}</span>
            </button>

            <button
              className="flex items-center space-x-2 py-2 px-4 rounded-full text-gray-400 hover:bg-red-900/30 transition-colors"
              disabled={!isActive}
            >
              <FaShare className="text-xl" />
            </button>
          </div>
        </div>

        {/* Comment Modal Popup */}
        {showCommentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-fadeIn">
              <div className="flex items-center justify-between p-5 border-b border-gray-800 spicy-gradient">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FaFire className="mr-2 text-yellow-400" />
                  Spicy Comments
                </h2>
                <button
                  onClick={closeComments}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white hover:bg-red-900/50 transition-colors"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto p-4 bg-gray-800">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={index} className="p-3 mb-3 rounded-lg bg-gray-700 border border-gray-600">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center spicy-gradient text-white shadow-sm">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="font-semibold text-white">{comment.user.name}</h6>
                          <small className="text-gray-400">{new Date(comment.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                      <p className="text-gray-300 pl-12">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <FaPepperHot className="text-4xl mb-3 text-red-500 opacity-30" />
                    <p>No spicy comments yet. Be the first to add some heat!</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-800 bg-gray-800">
                <form onSubmit={handleCommentSubmit} className="flex">
                  <input
                    type="text"
                    className="flex-grow p-3 border border-gray-700 rounded-l-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400"
                    placeholder="Add your spicy take..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 spicy-gradient text-white rounded-r-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
                    disabled={!commentText.trim()}
                  >
                    <FaPaperPlane />
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

