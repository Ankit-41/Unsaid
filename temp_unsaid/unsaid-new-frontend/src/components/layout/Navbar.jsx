"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import toast from "react-hot-toast"
import { FaBell, FaUser, FaSignOutAlt, FaCog, FaUserCircle, FaTimes, FaFire, FaPepperHot } from "react-icons/fa"

// Add this to your global CSS or component
const navbarStyles = `
@keyframes flameFlicker {
  0% { transform: scale(0.97); opacity: 0.8; }
  50% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(0.97); opacity: 0.8; }
}

.flame-flicker {
  animation: flameFlicker 3s infinite;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #b71c1c, #ff3d00);
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.navbar-container {
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.dropdown-menu {
  animation: dropIn 0.2s ease-out;
}

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
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
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-900 to-red-700 shadow-md">
        <div className="navbar-container px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              className="text-white text-xl font-bold tracking-tight hover:text-red-100 transition-colors flex items-center"
              href="/posts"
            >
              <FaFire className="mr-1 text-yellow-400 flame-flicker" />
              <span>Unsaid</span>
            </a>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-2 text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                  onClick={toggleNotifications}
                  aria-label="Notifications"
                >
                  <FaBell size={18} />
                  {notifications.length > 0 && (
                    <span className="notification-badge">{notifications.length > 9 ? "9+" : notifications.length}</span>
                  )}
                </button>

                {showNotifications && (
                  <div className="dropdown-menu absolute right-0 mt-2 w-72 rounded-lg bg-gray-900 shadow-xl border border-gray-800 overflow-hidden">
                    <div className="p-3 border-b border-gray-800 bg-gradient-to-r from-red-900 to-red-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white flex items-center">
                          <FaPepperHot className="mr-1 text-yellow-400" /> Hot Notifications
                        </h3>
                        <button
                          className="text-gray-200 hover:text-white transition-colors"
                          onClick={() => setShowNotifications(false)}
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-6 px-4 text-center">
                          <div className="mx-auto w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                            <FaBell className="text-gray-500" size={16} />
                          </div>
                          <p className="text-gray-400 text-sm">No spicy notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <a
                            key={index}
                            className="block px-4 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-0 transition-colors"
                            href="#"
                          >
                            <p className="text-sm text-gray-300">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
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

