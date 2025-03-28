"use client"

import { useState, useEffect, useRef } from "react"
import { postsAPI } from "../services/api"
import Post from "../components/posts/Post"
import ComposeButton from "../components/posts/ComposeButton"
import { FaChevronLeft, FaChevronRight, FaPepperHot, FaFire } from "react-icons/fa"
import toast from "react-hot-toast"

const postsPageStyles = `
  /* Ensure posts container is centered and takes available viewport space minus navbar height */
  .posts-wrapper {
    max-width: 500px;
    // margin: 60px auto 0; /* 60px top margin to account for the fixed navbar */
    height: calc(100vh - 60px);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Each post container is absolutely centered so that only one is visible at a time */
  .post-container {
    position: absolute;
    width: 100%;
    padding: 20px;
    transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.6s ease;
  }

  /* Navigation Buttons */
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
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState(null) // 'left' or 'right'
  const [swiping, setSwiping] = useState(false)

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

  // Auto-fetch more posts when nearing the end
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

  // Touch handlers for swiping
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
    setSwiping(true)
    setSwipeOffset(0)
  }

  const handleTouchMove = (e) => {
    if (!swiping) return
    const currentX = e.touches[0].clientX
    const diff = touchStartX - currentX
    setSwipeDirection(diff > 0 ? "left" : "right")
    const maxSwipe = window.innerWidth * 0.4
    setSwipeOffset(Math.max(Math.min(diff, maxSwipe), -maxSwipe))
  }

  const handleTouchEnd = (e) => {
    setSwiping(false)
    setSwipeOffset(0)
    const endX = e.changedTouches[0].clientX
    const diff = touchStartX - endX
    const minSwipeDistance = 50
    if (diff > minSwipeDistance) {
      navigateToNext()
    } else if (diff < -minSwipeDistance) {
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

  const getPostStyle = (index) => {
    const offset = (index - currentPostIndex) * 100
    let transform = `translateX(${offset}%)`
    let opacity = 1

    // Animate based on swipe and direction
    if (swipeDirection && !swiping) {
      if (swipeDirection === "left" && index === currentPostIndex - 1) {
        transform = `translateX(-100%) rotate(-5deg)`
        opacity = 0
      } else if (swipeDirection === "right" && index === currentPostIndex + 1) {
        transform = `translateX(100%) rotate(5deg)`
        opacity = 0
      }
    }
    if (swiping && index === currentPostIndex) {
      transform = `translateX(${-swipeOffset}px) rotate(${-swipeOffset * 0.02}deg)`
    }
    return {
      transform,
      opacity,
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="relative bg-gray-900 min-h-screen">
        <style>{postsPageStyles}</style>
        <div className="h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <FaPepperHot className="animate-spin text-5xl mb-4 text-red-500" />
            <p className="text-gray-300 font-medium">Heating up the spicy gossip...</p>
            <div className="mt-4 text-sm text-gray-400">Preparing the hottest tea for you</div>
          </div>
        </div>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen p-6 bg-gray-900">
        <div className="bg-gray-800 border border-red-900 text-red-400 p-6 rounded-lg shadow-md max-w-sm w-full">
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
    <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      <style>{postsPageStyles}</style>
      <div
        className="overflow-hidden"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="posts-wrapper">
          {posts.map((post, index) => (
            <div
              key={post._id}
              className="post-container"
              style={getPostStyle(index)}
            >
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
      <ComposeButton />
    </div>
  )
}

export default PostsPage
