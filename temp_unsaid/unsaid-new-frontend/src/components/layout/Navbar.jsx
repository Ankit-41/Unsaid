import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import { FaBell, FaUser, FaSignOutAlt, FaUserCircle, FaShieldAlt, FaFire, FaTimes, FaPepperHot } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  // Close dropdowns if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success("Logged out successfully", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      });
      setIsLoggedIn(false);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      });
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showDropdown) setShowDropdown(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out px-4 sm:px-6",
        isScrolled ? "py-3 bg-unsaid-darker/90 backdrop-blur-lg" : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo
        <a
          href="/posts"
          className="text-xl sm:text-2xl font-bold text-white flex items-center"
        >
          <FaFire className="mr-1 text-yellow-400 flame-flicker" />
          <span>Unsaid</span>
        </a> */}
        <a
  href="/"
  className="text-xl sm:text-2xl font-bold text-white flex items-center"
  style={{ textDecoration: 'none' }}
>
  <div className="flex items-center gap-2">
    <span className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
      UNSAID
    </span>
    <Badge variant="outline" className="text-xs bg-black/30 text-white/70 backdrop-blur-md border-white/10">
      IITR EXCLUSIVE
    </Badge>
  </div>
</a>


        {/* Desktop controls */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn && (
            <>
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-2 text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                  onClick={toggleNotifications}
                  aria-label="Notifications"
                >
                  <FaBell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-unsaid-accent text-white text-xs flex items-center justify-center">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="dropdown-menu absolute right-0 mt-2 w-72 rounded-lg bg-gray-900 shadow-xl border border-gray-800 overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-gray-800 bg-gradient-to-r from-red-900 to-red-700 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-white flex items-center">
                        <FaPepperHot className="mr-1 text-yellow-400" /> Notifications
                      </h3>
                      <button
                        className="text-gray-200 hover:text-white transition-colors"
                        onClick={() => setShowNotifications(false)}
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-6 px-4 text-center">
                          <div className="mx-auto w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                            <FaBell className="text-gray-500" size={16} />
                          </div>
                          <p className="text-gray-400 text-sm">No notifications yet</p>
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

              {/* User dropdown */}
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
                      {user && user.role === "admin" && (
                        <a
                          className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-red-400 transition-colors"
                          href="/admin"
                        >
                          <FaShieldAlt className="mr-3 text-red-500" size={16} />
                          Admin Portal
                        </a>
                      )}
                      <hr className="my-1 border-gray-700" />
                      <button
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 hover:text-red-400 transition-colors"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="mr-3 text-red-500" size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="block md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-unsaid-darker/95 backdrop-blur-lg border-t border-white/10 py-4 animate-fade-in">
          <div className="flex flex-col space-y-4 px-6">
            {isLoggedIn && (
              <>
                <button
                  className="flex items-center px-4 py-2 text-white hover:text-red-400 transition-colors"
                  onClick={toggleNotifications}
                >
                  <FaBell className="mr-2" size={18} /> Notifications
                </button>
                <button
                  className="flex items-center px-4 py-2 text-white hover:text-red-400 transition-colors"
                  onClick={toggleDropdown}
                >
                  <FaUser className="mr-2" size={18} /> Profile
                </button>
                <button
                  className="flex items-center px-4 py-2 text-white hover:text-red-400 transition-colors"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="mr-2" size={18} /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ href, children, mobile = false, onClick }) => {
  return (
    <a
      href={href}
      className={cn(
        "text-white/80 hover:text-white transition-colors duration-200 relative group",
        mobile ? "block py-2" : ""
      )}
      onClick={onClick}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-unsaid-accent group-hover:w-full transition-all duration-300" />
    </a>
  );
};

export default Navbar;
