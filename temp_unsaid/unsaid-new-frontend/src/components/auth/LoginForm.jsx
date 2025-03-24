"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import toast from "react-hot-toast"
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner, FaFire } from "react-icons/fa"

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
`

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
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
      <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden w-full mx-auto transform transition-all hover:shadow-2xl border border-gray-800">
        <div className="spicy-gradient p-6">
          <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center">
            <FaFire className="mr-2" /> Light Your Fire
          </h2>
          <p className="text-red-100 text-center mt-2">Sign in to spill and sip the tea</p>
        </div>

        <div className="p-6 sm:p-8 bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-red-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-red-500" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-700 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white spicy-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-70 heat-pulse"
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <a href="/register" className="font-medium text-red-400 hover:text-red-300 transition-colors">
                Get spicy now
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginForm

