"use client"

import { useEffect, useState } from "react"
import { adminAPI } from "../../services/api"
import toast from "react-hot-toast"
import {
  FaUserSecret,
  FaUserShield,
  FaUserMinus,
  FaUserPlus,
  FaSpinner,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa"

// Add this to your global CSS or component
const adminUserStyles = `
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-slide-in {
  animation: fadeSlideIn 0.3s ease-out forwards;
}

@keyframes glowPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 61, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0); }
}

.glow-pulse {
  animation: glowPulse 2s infinite;
}

.spicy-gradient {
  background: linear-gradient(135deg, #b71c1c, #ff3d00);
}

.admin-container {
  // max-width: 100%;
  margin: 0 auto;
  // padding: 0.75rem;
}

.user-card {
  display: flex;
  flex-direction: column;
  background-color: #1f2937;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.user-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: #9ca3af;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  margin-left: 0.5rem;
}

.user-actions {
  padding: 0.75rem;
  display: flex;
  justify-content: flex-end;
}

.action-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
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

.sort-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.sort-button:hover {
  background-color: rgba(75, 85, 99, 0.2);
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
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
  .user-grid {
    grid-template-columns: 1fr;
  }
}
`

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [animateIndex, setAnimateIndex] = useState(-1)

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers()
      // Adjust based on your API response shape:
      setUsers(response.data.data.users || response.data.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users.", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleAdmin = async (user, index) => {
    setAnimateIndex(index)
    try {
      if (user.role === "admin") {
        await adminAPI.removeAdmin(user._id)
        toast.success(`${user.name} is no longer a gossip moderator.`, {
          icon: "🔥",
          style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
        })
      } else {
        await adminAPI.makeAdmin(user._id)
        toast.success(`${user.name} is now a gossip moderator!`, {
          icon: "🔥",
          style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
        })
      }
      fetchUsers()
    } catch (error) {
      console.error("Error toggling admin:", error)
      toast.error("Failed to update user role.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setTimeout(() => setAnimateIndex(-1), 500)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ml-1" />
    return sortDirection === "asc" ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField]?.toLowerCase()
    const bValue = b[sortField]?.toLowerCase()

    if (!aValue || !bValue) return 0

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  if (loading) {
    return (
      <div className="admin-container">
        <div className="bg-gray-900 rounded-lg p-6 shadow-lg text-center">
          <FaSpinner className="text-red-500 text-3xl animate-spin mx-auto mb-3" />
          <p className="text-gray-300">Loading gossip network users...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{adminUserStyles}</style>
      <div className="admin-container">
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
          <div className="p-3 border-b border-gray-800 spicy-gradient">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FaUserSecret className="mr-2 glow-pulse" />
              Gossip Network Users
            </h2>
          </div>

          <div className="p-3 bg-gray-900">
            <div className="mb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-red-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <div className="sort-button" onClick={() => handleSort("name")}>
                <span className="text-sm text-gray-300">Name</span>
                {getSortIcon("name")}
              </div>
              <div className="sort-button" onClick={() => handleSort("email")}>
                <span className="text-sm text-gray-300">Email</span>
                {getSortIcon("email")}
              </div>
              <div className="sort-button" onClick={() => handleSort("role")}>
                <span className="text-sm text-gray-300">Role</span>
                {getSortIcon("role")}
              </div>
            </div>

            {sortedUsers.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-5 text-center">
                <FaUserSecret className="text-red-500 text-3xl mx-auto mb-3" />
                <p className="text-gray-300 text-base">No users found.</p>
                <p className="text-gray-500 mt-2 text-sm">Try a different search term.</p>
              </div>
            ) : (
              <div className="user-grid custom-scrollbar">
                {sortedUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className={`user-card ${animateIndex === index ? "transform scale-105" : ""} fade-slide-in`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="user-header">
                      <div className={`user-avatar ${user.role === "admin" ? "spicy-gradient" : "bg-gray-700"}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      <div className={`user-role ${user.role === "admin" ? "bg-red-500" : "bg-gray-600"}`}>
                        {user.role === "admin" ? (
                          <>
                            <FaUserShield className="mr-1" />
                            Mod
                          </>
                        ) : (
                          <>
                            <FaUserSecret className="mr-1" />
                            User
                          </>
                        )}
                      </div>
                    </div>
                    <div className="user-actions">
                      <button
                        onClick={() => handleToggleAdmin(user, index)}
                        className={`action-button ${
                          user.role === "admin"
                            ? "bg-gray-700 text-red-400 border border-red-500"
                            : "spicy-gradient text-white"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <>
                            <FaUserMinus className="mr-1" />
                            Remove Mod
                          </>
                        ) : (
                          <>
                            <FaUserPlus className="mr-1" />
                            Make Mod
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminUsers

