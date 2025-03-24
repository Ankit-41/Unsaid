"use client"

import { useState, useEffect, useRef } from "react"
// import { postsAPI } from "../../services/api"
import { postsAPI } from "../services/api"
// import Post from "../posts/Post"
import Post from "../components/posts/Post"
// import ComposeButton from "../posts/ComposeButton"
import ComposeButton from "../components/posts/ComposeButton"
import { FaChevronUp, FaChevronDown, FaPepperHot, FaFire } from "react-icons/fa"
import toast from "react-hot-toast"

// Add this to your global CSS or component
const postsPageStyles = `
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
    box-shadow: 0 0 15px rgba(255, 61, 0, 0.5);
  }
  
  .nav-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  @keyframes heatPulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(255, 61, 0, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0); }
  }
  
  .heat-pulse {
    animation: heatPulse 2s infinite;
  }

  .spicy-bg {
    // background-color: #1a1a1a;
    // background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zM15 40c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5z' fill='%23ff3d00' fillOpacity='0.05' fillRule='evenodd'/%3E%3C/svg%3E");
  }

  .spicy-gradient {
    background: linear-gradient(135deg, #b71c1c, #ff3d00);
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
      setLoading(true)
      const response = await postsAPI.getApprovedPosts(page)
      // Extract posts from data and pagination from the top level
      const newPosts = response.data.data.posts
      const currentPage = response.data.currentPage
      const totalPages = response.data.totalPages

      setPosts((prevPosts) => [...prevPosts, ...newPosts])
      setPage(currentPage + 1)
      setHasMore(currentPage < totalPages)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError("Failed to load the hot gossip. The tea might be too spicy right now.")
      toast.error("Failed to load the hot gossip", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setLoading(false)
    }
  }

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
          await fetchPosts()
          setScrollLocked(true)
          setCurrentPostIndex((prev) => prev + 1)
          setTimeout(() => setScrollLocked(false), 700)
        } else {
          toast.error("You've reached the end of the spicy gossip!", {
            icon: "🌶️",
            style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
          })
        }
      } else {
        setScrollLocked(true)
        setCurrentPostIndex((prev) => prev + 1)
        setTimeout(() => setScrollLocked(false), 700)
      }
    }
  }

  const getPostClassName = (index) => {
    if (index === currentPostIndex) return "post-container active"
    if (index < currentPostIndex) return "post-container prev"
    return "post-container next"
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen spicy-bg">
        <FaPepperHot className="animate-spin text-5xl mb-4 text-red-500" />
        <p className="text-gray-300 font-medium">Heating up the spicy gossip...</p>
        <div className="mt-4 text-sm text-gray-400">Preparing the hottest tea for you</div>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen p-6 spicy-bg">
        <div className="bg-gray-800 border border-red-900 text-red-400 p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center mb-4">
            <FaFire className="text-red-500 text-2xl mr-3" />
            <h3 className="text-lg font-semibold">Too Hot to Handle</h3>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="w-full px-4 py-2 spicy-gradient text-white rounded-md hover:opacity-90 transition flex items-center justify-center"
          >
            <FaPepperHot className="mr-2" /> Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative spicy-bg min-h-screen">
      {/* Add the CSS */}
      <style>{postsPageStyles}</style>

      {/* Posts container */}
      <div className="h-screen overflow-hidden spicy-bg" ref={containerRef} style={{ paddingTop: "60px" }}>
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
            className="nav-button p-3 bg-gray-800 rounded-full shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous post"
          >
            <FaChevronUp className="text-red-500" />
          </button>
          <button
            onClick={navigateToNext}
            // Disable only if scroll is locked or if there are no more posts available
            disabled={scrollLocked || (!hasMore && currentPostIndex >= posts.length - 1)}
            className="nav-button p-3 bg-gray-800 rounded-full shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed heat-pulse"
            aria-label="Next post"
          >
            <FaChevronDown className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Floating Compose Button */}
      <ComposeButton />
    </div>
  )
}

export default PostsPage

