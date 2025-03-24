"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import toast from "react-hot-toast"
import { FaBell, FaUser, FaSignOutAlt, FaCog, FaUserCircle, FaTimes, FaPepperHot, FaFire } from "react-icons/fa"

// Add this to your global CSS or component
const navbarStyles = `
@keyframes heatPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 61, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0); }
}

.heat-pulse {
  animation: heatPulse 2s infinite;
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
  background-color: #1a1a1a;
  // background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zM15 40c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5z' fill='%23ff3d00' fillOpacity='0.05' fillRule='evenodd'/%3E%3C/svg%3E");
}
`

function Navbar() {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      toast.success("Logged out successfully", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout. Please try again.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    }
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
    if (showNotifications) setShowNotifications(false)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    if (showDropdown) setShowDropdown(false)
  }

  return (
    <>
      <style>{navbarStyles}</style>
      <nav className="sticky top-0 z-50 spicy-bg border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              className="text-white text-2xl font-bold tracking-tight hover:text-red-400 transition-colors flex items-center spicy-shake"
              href="/posts"
            >
              <FaPepperHot className="mr-2 text-red-500 heat-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">Unsaid</span>
            </a>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-2 text-white rounded-full hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  onClick={toggleNotifications}
                  aria-label="Notifications"
                >
                  <FaBell size={20} className="text-red-400" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full spicy-gradient text-xs font-bold text-white heat-pulse">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg bg-gray-800 shadow-xl ring-1 ring-red-500/20 transition-all duration-200 ease-in-out origin-top-right animate-in fade-in slide-in-from-top-5">
                    <div className="p-3 border-b border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <FaFire className="mr-2 text-red-500" />
                          Hot Notifications
                        </h3>
                        <button
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          onClick={() => setShowNotifications(false)}
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 px-4 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                            <FaBell className="text-gray-500" size={20} />
                          </div>
                          <p className="text-gray-400">No hot gossip notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <a
                            key={index}
                            className="block px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-0 transition-colors"
                            href="#"
                          >
                            <p className="text-sm text-gray-200">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  onClick={toggleDropdown}
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full spicy-gradient flex items-center justify-center shadow-sm">
                    <FaUser size={16} className="text-white" />
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg ring-1 ring-red-500/20 transition-all duration-200 ease-in-out origin-top-right animate-in fade-in slide-in-from-top-5">
                    <div className="py-2">
                      <a
                        className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-red-400 transition-colors"
                        href="/profile"
                      >
                        <FaUserCircle className="mr-3 text-red-500" size={16} />
                        Profile
                      </a>
                      <a
                        className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-red-400 transition-colors"
                        href="/settings"
                      >
                        <FaCog className="mr-3 text-red-500" size={16} />
                        Settings
                      </a>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 transition-colors"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="mr-3 text-red-500" size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar

