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

.spicy-bg {
  // background-color: #1a1a1a;
  // background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zM15 40c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5z' fill='%23ff3d00' fillOpacity='0.05' fillRule='evenodd'/%3E%3C/svg%3E");
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
      <div className="bg-gray-900 rounded-lg p-8 shadow-lg text-center">
        <FaSpinner className="text-red-500 text-4xl animate-spin mx-auto mb-4" />
        <p className="text-gray-300">Loading gossip network users...</p>
      </div>
    )
  }

  return (
    <>
      <style>{adminUserStyles}</style>
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800 spicy-bg">
        <div className="p-5 border-b border-gray-800 spicy-gradient">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaUserSecret className="mr-2 glow-pulse" />
            Gossip Network Users
          </h2>
        </div>

        <div className="p-5 bg-gray-900">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-red-500" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {sortedUsers.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <FaUserSecret className="text-red-500 text-4xl mx-auto mb-3" />
              <p className="text-gray-300 text-lg">No users found.</p>
              <p className="text-gray-500 mt-2">Try a different search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-700 text-gray-200 text-left">
                    <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">Name {getSortIcon("name")}</div>
                    </th>
                    <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("email")}>
                      <div className="flex items-center">Email {getSortIcon("email")}</div>
                    </th>
                    <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("role")}>
                      <div className="flex items-center">Role {getSortIcon("role")}</div>
                    </th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sortedUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`text-gray-300 hover:bg-gray-700 transition-all duration-200 ${
                        animateIndex === index ? "transform scale-105 bg-gray-700" : ""
                      } fade-slide-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              user.role === "admin" ? "spicy-gradient" : "bg-gray-700"
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin" ? "bg-red-500 text-white" : "bg-gray-600 text-gray-200"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <div className="flex items-center">
                              <FaUserShield className="mr-1" />
                              Moderator
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <FaUserSecret className="mr-1" />
                              Gossiper
                            </div>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleAdmin(user, index)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                            user.role === "admin"
                              ? "bg-gray-700 text-red-400 hover:bg-gray-600 border border-red-500"
                              : "spicy-gradient text-white hover:opacity-90"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <>
                              <FaUserMinus className="mr-1" />
                              Remove Moderator
                            </>
                          ) : (
                            <>
                              <FaUserPlus className="mr-1" />
                              Make Moderator
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminUsers

