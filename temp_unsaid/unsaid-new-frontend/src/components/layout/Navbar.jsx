import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FaBell, FaUser, FaSignOutAlt, FaCog, FaUserCircle, FaTimes } from 'react-icons/fa';

function Navbar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
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
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a 
            className="text-white text-2xl font-bold tracking-tight hover:text-indigo-100 transition-colors" 
            href="/posts"
          >
            Unsaid
          </a>
          
          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                className="relative p-2 text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                onClick={toggleNotifications}
                aria-label="Notifications"
              >
                <FaBell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out origin-top-right animate-in fade-in slide-in-from-top-5">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                      <button 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowNotifications(false)}
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <FaBell className="text-gray-400" size={20} />
                        </div>
                        <p className="text-gray-500">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification, index) => (
                        <a 
                          key={index} 
                          className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                          href="#"
                        >
                          <p className="text-sm text-gray-700">{notification.message}</p>
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
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                onClick={toggleDropdown}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <FaUser size={16} className="text-indigo-600" />
                </div>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out origin-top-right animate-in fade-in slide-in-from-top-5">
                  <div className="py-2">
                    <a 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      href="/profile"
                    >
                      <FaUserCircle className="mr-3 text-gray-500" size={16} />
                      Profile
                    </a>
                    <a 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      href="/settings"
                    >
                      <FaCog className="mr-3 text-gray-500" size={16} />
                      Settings
                    </a>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
  );
}

export default Navbar;
