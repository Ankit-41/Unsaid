"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import toast from "react-hot-toast"
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner, FaFire } from "react-icons/fa"

// Updated global styles for the login form
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
  max-width: 400px;
  width: 100%;
  margin: 2rem auto;
  background-color: #1f2937;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #374151;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-section {
  padding: 1.5rem;
}

.header-section h2 {
  font-size: 1.5rem;
  font-weight: bold;
}

.header-section p {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.form-section {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #d1d5db;
}

.input-wrapper {
  position: relative;
}

.form-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #ef4444;
  font-size: 1rem;
}

.form-input {
  background-color: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 0.5rem;
  padding: 0.75rem 0.75rem 0.75rem 2.75rem;
  color: #fff;
  width: 100%;
  font-size: 0.95rem;
  transition: border 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #b71c1c;
  box-shadow: 0 0 0 2px rgba(183, 28, 28, 0.25);
}

.form-input::placeholder {
  color: rgba(156, 163, 175, 0.7);
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
  transition: transform 0.2s, opacity 0.2s;
  margin-top: 1rem;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-button:active:not(:disabled) {
  transform: scale(0.98);
}

.footer-text {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.footer-text a {
  font-weight: 500;
  color: #ef4444;
  transition: color 0.2s;
}

.footer-text a:hover {
  color: #f87171;
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
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        <div className="spicy-gradient header-section text-center">
          <h2 className="text-white flex items-center justify-center">
            <FaFire className="mr-2" /> Light Your Fire
          </h2>
          <p className="text-red-100">Sign in to spill and sip the tea</p>
        </div>

        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
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

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <FaLock className="form-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-button spicy-gradient text-white heat-pulse"
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

          <div className="footer-text">
            <p>
              Don't have an account?{" "}
              <a href="/register">
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
