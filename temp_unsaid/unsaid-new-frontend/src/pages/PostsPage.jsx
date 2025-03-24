"use client"

import { useState, useEffect, useRef } from "react"
import { postsAPI } from "../services/api"
import Post from "../components/posts/Post"
import ComposeButton from "../components/posts/ComposeButton"
import { FaSpinner, FaChevronUp, FaChevronDown, FaBell, FaUserCircle } from "react-icons/fa"
import "../styles/posts.css"
import toast from "react-hot-toast"

const cssToAdd = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .post-container {
    transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
    will-change: transform;
  }
  
  .post-container.active {
    z-index: 10;
  }
  
  .post-container.prev {
    z-index: 5;
  }
  
  .post-container.next {
    z-index: 5;
  }
  
  .nav-button {
    transition: all 0.2s ease;
  }
  
  .nav-button:hover:not(:disabled) {
    transform: scale(1.1);
  }
  
  .nav-button:active:not(:disabled) {
    transform: scale(0.95);
  }
`

function PostsPage() {
  const [posts, setPosts] = useState([])
  const [currentPostIndex, setCurrentPostIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [scrollLocked, setScrollLocked] = useState(false)

  const containerRef = useRef(null)
  const touchStartY = useRef(0)
  const lastScrollTime = useRef(0)

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getApprovedPosts(page);
      // Extract posts from data and pagination from the top level
      const newPosts = response.data.data.posts;
      const currentPage = response.data.currentPage;
      const totalPages = response.data.totalPages;
  
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage(currentPage + 1);
      setHasMore(currentPage < totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again later.");
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };


  // When user nears the end, automatically fetch more posts if available.
  useEffect(() => {
    if (posts.length > 0 && currentPostIndex >= posts.length - 2 && hasMore && !loading) {
      fetchPosts()
    }
  }, [currentPostIndex, posts.length, hasMore, loading])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (scrollLocked) return
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        navigateToPrev()
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        navigateToNext()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPostIndex, posts.length, scrollLocked])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
    }
    const handleTouchMove = (e) => {
      if (scrollLocked) return
      const touchY = e.touches[0].clientY
      const diff = touchStartY.current - touchY
      const now = Date.now()
      if (Math.abs(diff) > 70 && now - lastScrollTime.current > 700) {
        diff > 0 ? navigateToNext() : navigateToPrev()
        lastScrollTime.current = now
      }
    }
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchmove", handleTouchMove)
    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
    }
  }, [currentPostIndex, posts.length, scrollLocked])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      if (scrollLocked) return
      const now = Date.now()
      if (now - lastScrollTime.current > 700) {
        if (e.deltaY > 70) {
          navigateToNext()
          lastScrollTime.current = now
        } else if (e.deltaY < -70) {
          navigateToPrev()
          lastScrollTime.current = now
        }
      }
    }
    container.addEventListener("wheel", handleWheel, { passive: true })
    return () => {
      container.removeEventListener("wheel", handleWheel)
    }
  }, [currentPostIndex, posts.length, scrollLocked])

  const navigateToPrev = () => {
    if (currentPostIndex > 0 && !scrollLocked) {
      setScrollLocked(true)
      setCurrentPostIndex((prev) => prev - 1)
      setTimeout(() => setScrollLocked(false), 700)
    }
  }

  const navigateToNext = async () => {
    if (!scrollLocked) {
      // If at the last post but more posts are available, fetch additional posts first.
      if (currentPostIndex >= posts.length - 1) {
        if (hasMore) {
          await fetchPosts();
          setScrollLocked(true);
          setCurrentPostIndex((prev) => prev + 1);
          setTimeout(() => setScrollLocked(false), 700);
        } else {
          toast.error("You have reached the end of posts");
        }
      } else {
        setScrollLocked(true);
        setCurrentPostIndex((prev) => prev + 1);
        setTimeout(() => setScrollLocked(false), 700);
      }
    }
  };
  

  const getPostClassName = (index) => {
    if (index === currentPostIndex) return "post-container active"
    if (index < currentPostIndex) return "post-container prev"
    return "post-container next"
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <FaSpinner className="animate-spin text-4xl mb-4 text-indigo-600 dark:text-indigo-400" />
        <p className="text-gray-700 dark:text-gray-300 font-medium">Loading posts...</p>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-6 rounded-lg shadow-md max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Add the CSS */}
      <style>{cssToAdd}</style>

      {/* Posts container */}
      <div
        className="h-screen overflow-hidden bg-gray-100 dark:bg-gray-900"
        ref={containerRef}
        style={{ paddingTop: "60px" }}
      >
        {posts.map((post, index) => (
          <div
            key={post._id}
            className={getPostClassName(index)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: `translateY(${(index - currentPostIndex) * 100}%)`,
              visibility: Math.abs(index - currentPostIndex) > 1 ? "hidden" : "visible",
            }}
          >
            <Post post={post} isActive={index === currentPostIndex} />
          </div>
        ))}

        {/* Navigation Controls */}
        <div className="fixed right-5 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3 z-30">
          <button
            onClick={navigateToPrev}
            disabled={currentPostIndex === 0 || scrollLocked}
            className="nav-button p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous post"
          >
            <FaChevronUp className="text-indigo-600 dark:text-indigo-400" />
          </button>
          <button
            onClick={navigateToNext}
            // Disable only if scroll is locked or if there are no more posts available
            disabled={scrollLocked || (!hasMore && currentPostIndex >= posts.length - 1)}
            className="nav-button p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next post"
          >
            <FaChevronDown className="text-indigo-600 dark:text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Floating Compose Button */}
      <ComposeButton />
    </div>
  )
}

export default PostsPage
