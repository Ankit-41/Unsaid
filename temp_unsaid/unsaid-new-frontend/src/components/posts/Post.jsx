"use client"

import { useState, useEffect } from "react"
import { FaHeart, FaRegHeart, FaComment, FaShare, FaTimes, FaPaperPlane } from "react-icons/fa"
import { postsAPI } from "../../services/api"
import toast from "react-hot-toast"

function Post({ post, isActive }) {
  // Set initial liked state based on an already-liked error flag
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [alreadyLikedError, setAlreadyLikedError] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  useEffect(() => {
    // Set the correct like count when post changes
    setLikeCount(Array.isArray(post.likes) ? post.likes.length : 0);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser._id) {
      const userHasLiked = Array.isArray(post.likes) && post.likes.some(like => {
        if (typeof like === "string") {
          return String(like) === String(currentUser._id);
        } else if (like && typeof like === "object" && like._id) {
          return String(like._id) === String(currentUser._id);
        }
        return false;
      });
      setLiked(userHasLiked);
    }
  }, [post]);


  const toggleLike = async () => {
    try {
      if (!liked && !alreadyLikedError) {
        // Like the post
        const response = await postsAPI.likePost(post._id);

        // Handle success
        toast.success("Post liked successfully!");
        setLiked(true);
        setLikeCount(prev => prev + 1);
      } else {
        // Unlike the post
        const response = await postsAPI.unlikePost(post._id);

        // Update state
        setLiked(false);
        setAlreadyLikedError(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        toast.success("Post unliked successfully!");
      }
    } catch (error) {
      console.error(`Error toggling like:`, error);

      // If it's an "already liked" error, use this to our advantage
      if (error.response?.data?.message?.includes("already liked")) {
        toast.error(error.response.data.message);
        setLiked(true);
        setAlreadyLikedError(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to update like. Please try again.");
      }
    }
  };

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
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error(error.response?.data?.message || "Failed to add comment. Please try again.")
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white mr-4 shadow-md">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h6 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {post.isAnonymous ? "Anonymous" : post.author.name}
            </h6>
            <small className="text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleString()}</small>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="flex-grow p-8 flex items-center justify-center overflow-auto">
        <div className="text-3xl md:text-4xl text-center font-medium text-gray-800 dark:text-gray-100 max-w-2xl mx-auto px-4">
          {post.content}
        </div>
      </div>

      {/* Interactive Controls – visible only if active */}
      <div
        className={`p-3 mb-20 pt-3 pb-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button
            className="flex items-center space-x-2 py-2 px-4 rounded-full transition-colors"
            onClick={toggleLike}
            disabled={!isActive}
          >
            {/* Show red heart if liked OR if we got an "already liked" error */}
            {liked
              ? <FaHeart className="text-xl text-red-500" />
              : <FaRegHeart className="text-xl" />
            }

            <span className="font-medium" style={{ color: (liked || alreadyLikedError) ? '#FF0000' : 'inherit' }}>
              {likeCount}
            </span>
          </button>

          <button
            className="flex items-center space-x-2 py-2 px-4 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={openComments}
            disabled={!isActive}
          >
            <FaComment className="text-xl" />
            <span className="font-medium">{comments.length}</span>
          </button>

          <button
            className="flex items-center space-x-2 py-2 px-4 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={!isActive}
          >
            <FaShare className="text-xl" />
          </button>
        </div>
      </div>

      {/* Comment Modal Popup */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-fadeIn">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Comments</h2>
              <button
                onClick={closeComments}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-4">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={index} className="p-3 mb-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800 dark:text-gray-100">{comment.user.name}</h6>
                        <small className="text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </small>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pl-12">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <FaComment className="text-4xl mb-3 opacity-30" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleCommentSubmit} className="flex">
                <input
                  type="text"
                  className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-r-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
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
  )
}

export default Post
