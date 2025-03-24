"use client"

import { useEffect, useState } from "react"
import { postsAPI } from "../../services/api"
import toast from "react-hot-toast"
import { FaSearch, FaFilter, FaFire, FaCheck, FaTimes, FaTrash, FaSpinner, FaPepperHot } from "react-icons/fa"

// Add this to your global CSS or component
const adminStyles = `
@keyframes heatPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 61, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0); }
}

.heat-pulse {
  animation: heatPulse 2s infinite;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-slide-in {
  animation: fadeSlideIn 0.3s ease-out forwards;
}

.spicy-gradient {
  background: linear-gradient(135deg, #b71c1c, #ff3d00);
}

.spicy-bg {
  background-color: #1a1a1a;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zM15 40c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5z' fill='%23ff3d00' fillOpacity='0.05' fillRule='evenodd'/%3E%3C/svg%3E");
}
`

const statusColors = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  disapproved: "bg-red-500",
  removed: "bg-gray-500",
}

const statusIcons = {
  pending: <FaFire className="mr-1" />,
  approved: <FaCheck className="mr-1" />,
  disapproved: <FaTimes className="mr-1" />,
  removed: <FaTrash className="mr-1" />,
}

const getSpicyLevel = (content) => {
  // This is a simple algorithm to determine "spiciness" based on content length
  // In a real app, you might have a more sophisticated way to determine this
  const length = content.length
  if (length > 400) return 5
  if (length > 300) return 4
  if (length > 200) return 3
  if (length > 100) return 2
  return 1
}

const AdminPosts = () => {
  const [posts, setPosts] = useState([])
  const [filterStatus, setFilterStatus] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [animateIndex, setAnimateIndex] = useState(-1)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let response
      if (searchQuery.trim()) {
        // Use the search endpoint
        response = await postsAPI.searchPosts(searchQuery)
      } else {
        response = await postsAPI.getAllPosts()
      }
      let fetchedPosts = response.data.data.posts || response.data.data
      // Apply filter if selected
      if (filterStatus) {
        fetchedPosts = fetchedPosts.filter((post) => post.status === filterStatus)
      }
      setPosts(fetchedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load the hot gossip.", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchQuery])

  const handleStatusChange = async (postId, newStatus, index) => {
    setAnimateIndex(index)
    try {
      await postsAPI.updatePostStatus(postId, newStatus)
      toast.success(`Post status updated to ${newStatus}!`, {
        icon: statusIcons[newStatus],
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
      fetchPosts()
    } catch (error) {
      console.error("Error updating post status:", error)
      toast.error("Failed to update post status.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setTimeout(() => setAnimateIndex(-1), 500)
    }
  }

  const statusOptions = ["pending", "approved", "disapproved", "removed"]

  return (
    <>
      <style>{adminStyles}</style>
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800 spicy-bg">
        <div className="p-5 border-b border-gray-800 spicy-gradient">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaPepperHot className="mr-2 heat-pulse" />
            Hot Gossip Management
          </h2>
        </div>

        <div className="p-5 bg-gray-900">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-red-500" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 w-full py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="">All Gossip</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-red-500" />
              </div>
              <input
                type="text"
                placeholder="Search for juicy gossip..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="text-red-500 text-4xl animate-spin mb-4" />
              <p className="text-gray-400">Gathering the hottest gossip...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <FaFire className="text-red-500 text-4xl mx-auto mb-3" />
              <p className="text-gray-300 text-lg">No spicy gossip found.</p>
              <p className="text-gray-500 mt-2">Try a different filter or search term.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => {
                const spicyLevel = post.spicyLevel || getSpicyLevel(post.content)

                return (
                  <div
                    key={post._id}
                    className={`bg-gray-800 rounded-lg overflow-hidden border border-gray-700 transition-all duration-300 ${
                      animateIndex === index ? "transform scale-105" : ""
                    } fade-slide-in`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${post.isAnonymous ? "bg-gray-700" : "spicy-gradient"} mr-3`}
                        >
                          {post.isAnonymous ? "A" : post.author?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {post.isAnonymous ? "Anonymous" : post.author?.name}
                          </div>
                          <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[post.status]} text-white`}
                        >
                          {statusIcons[post.status]}
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-3 text-white">{post.content}</div>

                      <div className="flex items-center mb-4">
                        <span className="text-gray-400 text-sm mr-2">Spicy Level:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaPepperHot
                              key={i}
                              className={`${i < spicyLevel ? "text-red-500" : "text-gray-600"} ${i === spicyLevel - 1 ? "heat-pulse" : ""}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(post._id, status, index)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                              post.status === status
                                ? "bg-gray-700 text-white border-2 border-red-500"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                            }`}
                          >
                            {statusIcons[status]}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminPosts

