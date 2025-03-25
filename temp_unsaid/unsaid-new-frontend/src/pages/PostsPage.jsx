"use client"

import { useState, useEffect, useRef } from "react"
import { postsAPI } from "../services/api"
import Post from "../components/posts/Post"
import ComposeButton from "../components/posts/ComposeButton"
import { FaChevronLeft, FaChevronRight, FaPepperHot, FaFire } from "react-icons/fa"
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
    transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.6s ease, rotate 0.6s ease;
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
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 61, 0, 0.2);
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

  .posts-wrapper {
    max-width: 500px;
    margin: 0 auto;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .swipe-indicator {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 8px;
    z-index: 20;
  }

  .swipe-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .swipe-dot.active {
    background-color: rgba(255, 61, 0, 0.8);
    transform: scale(1.2);
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  }

  .loading-pepper {
    animation: bounce 1.5s infinite alternate;
  }

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-15px); }
  }

  .error-container {
    max-width: 90%;
    width: 350px;
  }

  /* Skeleton loading styles */
  .skeleton {
    background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 0.5rem;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
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
`

function PostsPage() {
  const [posts, setPosts] = useState([])
  const [currentPostIndex, setCurrentPostIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [scrollLocked, setScrollLocked] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState(null) // 'left' or 'right'

  const containerRef = useRef(null)
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
      if (e.key === "ArrowLeft") {
        navigateToPrev()
      } else if (e.key === "ArrowRight") {
        navigateToNext()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPostIndex, posts.length, scrollLocked])

  // Mouse wheel horizontal scrolling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      if (scrollLocked) return
      const now = Date.now()
      if (now - lastScrollTime.current > 700) {
        if (e.deltaX > 70) {
          setSwipeDirection("left")
          navigateToNext()
          lastScrollTime.current = now
        } else if (e.deltaX < -70) {
          setSwipeDirection("right")
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

  // Touch handlers for horizontal swiping
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
    setSwiping(true)
    setSwipeOffset(0)
  }

  const handleTouchMove = (e) => {
    if (!swiping) return
    const currentX = e.touches[0].clientX
    const diff = touchStartX - currentX
    // Determine swipe direction
    if (diff > 0) {
      setSwipeDirection("left")
    } else {
      setSwipeDirection("right")
    }
    // Limit the swipe distance
    const maxSwipe = window.innerWidth * 0.4
    const limitedDiff = Math.max(Math.min(diff, maxSwipe), -maxSwipe)
    setSwipeOffset(limitedDiff)
  }

  const handleTouchEnd = (e) => {
    setSwiping(false)
    setSwipeOffset(0)

    if (scrollLocked) return

    const endX = e.changedTouches[0].clientX
    setTouchEndX(endX)

    const diff = touchStartX - endX
    const minSwipeDistance = 50 // Minimum distance to trigger a swipe

    if (diff > minSwipeDistance) {
      // Swiped left, go to next post
      navigateToNext()
    } else if (diff < -minSwipeDistance) {
      // Swiped right, go to previous post
      navigateToPrev()
    }
  }

  const navigateToPrev = () => {
    if (currentPostIndex > 0 && !scrollLocked) {
      setScrollLocked(true)
      setSwipeDirection("right")
      setCurrentPostIndex((prev) => prev - 1)
      setTimeout(() => {
        setScrollLocked(false)
        setSwipeDirection(null)
      }, 700)
    }
  }

  const navigateToNext = async () => {
    if (!scrollLocked) {
      // If at the last post but more posts are available, fetch additional posts first.
      if (currentPostIndex >= posts.length - 1) {
        if (hasMore) {
          await fetchPosts()
          setScrollLocked(true)
          setSwipeDirection("left")
          setCurrentPostIndex((prev) => prev + 1)
          setTimeout(() => {
            setScrollLocked(false)
            setSwipeDirection(null)
          }, 700)
        } else {
          toast.error("You've reached the end of the spicy gossip!", {
            icon: "🌶️",
            style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
          })
        }
      } else {
        setScrollLocked(true)
        setSwipeDirection("left")
        setCurrentPostIndex((prev) => prev + 1)
        setTimeout(() => {
          setScrollLocked(false)
          setSwipeDirection(null)
        }, 700)
      }
    }
  }

  const getPostClassName = (index) => {
    if (index === currentPostIndex) return "post-container active"
    if (index < currentPostIndex) return "post-container prev"
    return "post-container next"
  }

  // Modified getPostStyle to correctly animate the outgoing and incoming cards
  const getPostStyle = (index) => {
    const baseStyle = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      visibility: Math.abs(index - currentPostIndex) > 1 ? "hidden" : "visible",
    }

    // Default horizontal positioning
    let transform = `translateX(${(index - currentPostIndex) * 100}%)`
    let opacity = 1

    // Adjust animation based on swipe direction (when not actively dragging)
    if (swipeDirection && !swiping) {
      if (swipeDirection === "left") {
        // After a left swipe, currentPostIndex is incremented.
        // The outgoing (old) card is at currentPostIndex - 1.
        if (index === currentPostIndex - 1) {
          transform = `translateX(-100%) rotate(-5deg)`
          opacity = 0
        } else if (index === currentPostIndex) {
          transform = `translateX(0%) rotate(0deg)`
          opacity = 1
        }
      } else if (swipeDirection === "right") {
        // After a right swipe, currentPostIndex is decremented.
        // The outgoing (old) card is at currentPostIndex + 1.
        if (index === currentPostIndex + 1) {
          transform = `translateX(100%) rotate(5deg)`
          opacity = 0
        } else if (index === currentPostIndex) {
          transform = `translateX(0%) rotate(0deg)`
          opacity = 1
        }
      }
    }

    // When actively swiping, update transform based on swipe offset.
    if (swiping) {
      if (index === currentPostIndex) {
        transform = `translateX(${-swipeOffset}px) rotate(${-swipeOffset * 0.02}deg)`
      } else if (index === currentPostIndex + 1) {
        transform = `translateX(calc(100% - ${swipeOffset}px)) rotate(${(100 - swipeOffset) * 0.02}deg)`
      } else if (index === currentPostIndex - 1) {
        transform = `translateX(calc(-100% - ${swipeOffset}px)) rotate(${(-100 - swipeOffset) * 0.02}deg)`
      }
    }

    return {
      ...baseStyle,
      transform,
      opacity,
      transition: "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.6s ease, rotate 0.6s ease",
    }
  }

  // Skeleton loading component
  const SkeletonPost = () => (
    <div className="post-card bg-gray-900 h-full flex flex-col">
      <div className="p-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full skeleton mr-3"></div>
          <div className="flex-1">
            <div className="h-4 skeleton w-24 mb-2"></div>
            <div className="h-3 skeleton w-32"></div>
          </div>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full skeleton mx-0.5"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center bg-gray-800 p-4">
        <div className="w-full">
          <div className="h-6 skeleton w-full mb-4"></div>
          <div className="h-6 skeleton w-3/4 mb-4"></div>
          <div className="h-6 skeleton w-5/6"></div>
        </div>
      </div>
      <div className="p-3 bg-gray-900 flex justify-around">
        <div className="h-8 w-16 skeleton rounded-full"></div>
        <div className="h-8 w-16 skeleton rounded-full"></div>
        <div className="h-8 w-16 skeleton rounded-full"></div>
      </div>
    </div>
  )

  if (loading && posts.length === 0) {
    return (
      <div className="relative bg-gray-900 min-h-screen">
        <style>{postsPageStyles}</style>
        <div className="h-screen overflow-hidden bg-gray-900" style={{ paddingTop: "60px" }}>
          <div className="posts-wrapper">
            <SkeletonPost />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
              <FaPepperHot className="animate-spin text-5xl mb-4 text-red-500" />
              <p className="text-gray-300 font-medium">Heating up the spicy gossip...</p>
              <div className="mt-4 text-sm text-gray-400">Preparing the hottest tea for you</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen p-6 bg-gray-900">
        <div className="error-container bg-gray-800 border border-red-900 text-red-400 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaFire className="text-red-500 text-2xl mr-3" />
            <h3 className="text-lg font-semibold">Too Hot to Handle</h3>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-700 to-red-500 text-white rounded-md hover:opacity-90 transition flex items-center justify-center"
          >
            <FaPepperHot className="mr-2" /> Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className=" relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 min-h-screen">
      {/* Add the CSS */}
      <style>{postsPageStyles}</style>

      {/* Posts container */}
      <div
        className="h-screen overflow-hidden"
        ref={containerRef}
        style={{ paddingTop: "60px" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="posts-wrapper">
          {posts.map((post, index) => (
            <div key={post._id} className={getPostClassName(index)} style={getPostStyle(index)}>
              <Post post={post} isActive={index === currentPostIndex} />
            </div>
          ))}

          {/* Navigation Controls */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30">
            <button
              onClick={navigateToPrev}
              disabled={currentPostIndex === 0 || scrollLocked}
              className="nav-button disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous post"
            >
              <FaChevronLeft className="text-red-500" />
            </button>
          </div>

          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30">
            <button
              onClick={navigateToNext}
              disabled={scrollLocked || (!hasMore && currentPostIndex >= posts.length - 1)}
              className="nav-button disabled:opacity-40 disabled:cursor-not-allowed heat-pulse"
              aria-label="Next post"
            >
              <FaChevronRight className="text-red-500" />
            </button>
          </div>

          
        </div>
      </div>

      {/* Floating Compose Button */}
      <ComposeButton />
    </div>
  )
}

export default PostsPage

