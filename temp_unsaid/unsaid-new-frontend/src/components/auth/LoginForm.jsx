"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import toast from "react-hot-toast"
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa"

// Add this to your global CSS or component
const loginFormStyles = `
@keyframes heatPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 61, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0); }
}

.heat-pulse {
  animation: heatPulse 2s infinite;
}

.spicy-gradient {
  background: linear-gradient(135deg, #b71c1c, #ff3d00);
}

.login-form {
  width: 100%;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.form-input {
  background-color: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 0.5rem;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  color: white;
  width: 100%;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #b71c1c;
  box-shadow: 0 0 0 2px rgba(183, 28, 28, 0.25);
}

.form-input::placeholder {
  color: rgba(156, 163, 175, 0.7);
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(209, 213, 219, 0.9);
  margin-bottom: 0.375rem;
}

.form-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #ef4444;
  font-size: 1rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(255, 61, 0, 0.3);
}

.submit-button:not(:disabled):active {
  transform: translateY(1px);
}

.form-card {
  transition: all 0.3s ease;
}

.form-link {
  position: relative;
  display: inline-block;
}

.form-link::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #ff3d00;
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease;
}

.form-link:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .form-input {
    padding: 0.7rem 0.7rem 0.7rem 2.25rem;
    font-size: 0.9rem;
  }
  
  .form-icon {
    font-size: 0.9rem;
  }
  
  .submit-button {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
}
`

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.login(formData)
      toast.success("Welcome to the hot gossip network!", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
      navigate("/posts")
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.response?.data?.message || "Failed to login. Please try again.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{loginFormStyles}</style>
      <div className="login-form">
        <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
          <div className="p-5 bg-gray-900">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="form-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="form-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors form-link"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button spicy-gradient text-white heat-pulse mt-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Heating up...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="mr-2" />
                    Bring the Heat
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginForm
