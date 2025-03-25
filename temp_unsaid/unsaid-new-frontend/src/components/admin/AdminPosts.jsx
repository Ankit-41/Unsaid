"use client"

import { useEffect, useState } from "react"
import { postsAPI } from "../../services/api"
import toast from "react-hot-toast"
import {
  FaSearch,
  FaFilter,
  FaFire,
  FaCheck,
  FaTimes,
  FaTrash,
  FaSpinner,
  FaPepperHot,
  FaEllipsisH,
} from "react-icons/fa"

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

.admin-container {
  // max-width: 95%;
  margin: 0 auto;

}

.post-card {
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.post-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.post-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.post-content {
  padding: 0.75rem;
  word-break: break-word;
}

.post-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
}

.action-button:hover {
  opacity: 0.9;
}

.action-button:active {
  transform: scale(0.98);
}

.spicy-level {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
}

.dropdown-menu {
  position: absolute;
  right: 0.75rem;
  top: 2.5rem;
  background-color: #1f2937;
  border-radius: 0.375rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
  border: 1px solid rgba(75, 85, 99, 0.3);
  width: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #d1d5db;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: rgba(75, 85, 99, 0.2);
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
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

@media (max-width: 640px) {
  .post-actions {
    justify-content: center;
  }
  
  .action-button {
    flex: 1 0 auto;
    justify-content: center;
  }
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
  const [expandedPost, setExpandedPost] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(null)

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
      setDropdownOpen(null)
    }
  }

  const toggleExpandPost = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
    } else {
      setExpandedPost(postId)
    }
  }

  const toggleDropdown = (index) => {
    if (dropdownOpen === index) {
      setDropdownOpen(null)
    } else {
      setDropdownOpen(index)
    }
  }

  const statusOptions = ["pending", "approved", "disapproved", "removed"]

  return (
    <>
      <style>{adminStyles}</style>
      <div className=" admin-container">
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
          <div className="p-3 border-b border-gray-800 spicy-gradient">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FaPepperHot className="mr-2 heat-pulse" />
              Hot Gossip Management
            </h2>
          </div>

          <div className="p-3 bg-gray-900">
            <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-red-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search for juicy gossip..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-red-500" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 w-full py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
                >
                  <option value="">All Gossip</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FaSpinner className="text-red-500 text-3xl animate-spin mb-3" />
                <p className="text-gray-400 text-sm">Gathering the hottest gossip...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-5 text-center">
                <FaFire className="text-red-500 text-3xl mx-auto mb-3" />
                <p className="text-gray-300 text-base">No spicy gossip found.</p>
                <p className="text-gray-500 mt-2 text-sm">Try a different filter or search term.</p>
              </div>
            ) : (
              <div className="space-y-3 custom-scrollbar">
                {posts.map((post, index) => {
                  const spicyLevel = post.spicyLevel || getSpicyLevel(post.content)
                  const isExpanded = expandedPost === post._id
                  const isDropdownOpen = dropdownOpen === index

                  return (
                    <div
                      key={post._id}
                      className={`post-card bg-gray-800 ${
                        animateIndex === index ? "transform scale-105" : ""
                      } fade-slide-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="post-header bg-gray-800">
                        <div className="post-avatar bg-gray-700">
                          {post.isAnonymous ? (
                            <FaFire className="text-red-500" />
                          ) : (
                            post.author?.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm truncate">
                            {post.isAnonymous ? "Anonymous" : post.author?.name}
                          </div>
                          <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
                        </div>

                        <div className="flex items-center ml-2">
                          <div className={`status-badge ${statusColors[post.status]}`}>
                            {statusIcons[post.status]}
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </div>

                          <div className="relative ml-2">
                            <button
                              className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
                              onClick={() => toggleDropdown(index)}
                            >
                              <FaEllipsisH />
                            </button>

                            {isDropdownOpen && (
                              <div className="dropdown-menu">
                                {statusOptions.map((status) => (
                                  <button
                                    key={status}
                                    className="dropdown-item"
                                    onClick={() => handleStatusChange(post._id, status, index)}
                                  >
                                    {statusIcons[status]}
                                    <span className="ml-2">Mark as {status}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className="post-content text-white text-sm"
                        style={{
                          maxHeight: isExpanded ? "none" : "100px",
                          overflow: isExpanded ? "visible" : "hidden",
                          position: "relative",
                        }}
                      >
                        <p>{post.content}</p>

                        {!isExpanded && post.content.length > 150 && (
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-800 to-transparent"></div>
                        )}
                      </div>

                      {post.content.length > 150 && (
                        <button
                          onClick={() => toggleExpandPost(post._id)}
                          className="text-xs text-red-400 hover:text-red-300 px-3 py-1 mt-1"
                        >
                          {isExpanded ? "Show less" : "Read more..."}
                        </button>
                      )}

                      <div className="spicy-level px-3 py-1">
                        <span className="text-gray-400 text-xs mr-2">Spicy Level:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaPepperHot
                              key={i}
                              size={12}
                              className={`${i < spicyLevel ? "text-red-500" : "text-gray-600"} ${
                                i === spicyLevel - 1 ? "heat-pulse" : ""
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="post-actions border-t border-gray-700">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(post._id, status, index)}
                            className={`action-button ${
                              post.status === status
                                ? "bg-gray-700 text-white border border-red-500"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                            }`}
                          >
                            {statusIcons[status]}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminPosts

