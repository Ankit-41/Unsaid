"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import toast from "react-hot-toast"
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserPlus,
  FaSpinner,
  FaKey,
  FaArrowLeft,
  FaFire,
  FaPepperHot,
} from "react-icons/fa"

// Updated global styles for the registration form
const registerFormStyles = `
@keyframes heatPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 61, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0); }
}

.heat-pulse {
  animation: heatPulse 2s infinite;
}

@keyframes spicyEntrance {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); opacity: 1; }
}

.spicy-entrance {
  animation: spicyEntrance 0.4s ease-out forwards;
}

.spicy-gradient {
  background: linear-gradient(135deg, #b71c1c, #ff3d00);
}

.register-form {
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
  text-align: center;
}

.header-section h2 {
  font-size: 1.5rem;
  font-weight: bold;
}

.header-section p {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #fca5a5;
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

.otp-input {
  letter-spacing: 0.25em;
  text-align: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  color: #f87171;
  transition: color 0.2s;
  margin-bottom: 1rem;
}

.back-button:hover {
  color: #ef4444;
}

.verification-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem auto;
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

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [otp, setOtp] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
      setLoading(false)
      return
    }

    try {
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      toast.success("Registration successful! Verify your email to start gossiping.", {
        icon: "🌶️",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
      setShowOtpForm(true)
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.response?.data?.message || "Failed to register. Please try again.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.verifyEmail({
        email: formData.email,
        otp,
      })
      toast.success("Email verified! Time to spill some tea!", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
      navigate("/login")
    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error(error.response?.data?.message || "Failed to verify OTP. Please try again.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      await authAPI.resendOTP(formData.email)
      toast.success("OTP resent to your email", {
        icon: "🌶️",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast.error(error.response?.data?.message || "Failed to resend OTP. Please try again.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    }
  }

  const goBackToRegister = () => {
    setShowOtpForm(false)
  }

  return (
    <>
      <style>{registerFormStyles}</style>
      <div className="register-form">
        <div className="spicy-gradient header-section">
          <h2 className="text-white flex items-center justify-center">
            {showOtpForm ? (
              <>
                <FaKey className="mr-2" /> Verify Your Identity
              </>
            ) : (
              <>
                <FaPepperHot className="mr-2" /> Join the Spice Club
              </>
            )}
          </h2>
          <p className="text-red-100">
            {showOtpForm
              ? "One step away from the juiciest gossip"
              : "Create your anonymous gossip profile"}
          </p>
        </div>

        <div className="form-section">
          {!showOtpForm ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Display Name
                </label>
                <div className="input-wrapper">
                  <FaUser className="form-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="What should we call you?"
                    required
                    className="form-input"
                  />
                </div>
              </div>

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
                    placeholder="Where to send the hot gossip"
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
                    placeholder="Create a spicy password"
                    required
                    className="form-input"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Make it hot! At least 8 characters with letters, numbers, and symbols.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <FaLock className="form-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your spicy password"
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
                    Heating Things Up...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Bring the Heat
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="spicy-entrance">
              <button onClick={goBackToRegister} className="back-button">
                <FaArrowLeft className="mr-1" />
                Back to registration
              </button>

              <div className="verification-icon spicy-gradient">
                <FaFire className="text-white text-xl" />
              </div>

              <p className="text-center text-gray-300 text-sm">
                We've sent a verification code to
                <br />
                <span className="font-medium text-red-400">{formData.email}</span>
              </p>

              <form onSubmit={handleOtpSubmit}>
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">
                    Verification Code
                  </label>
                  <div className="input-wrapper">
                    <FaKey className="form-icon" />
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the 6-digit code"
                      required
                      className="form-input otp-input"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="submit-button spicy-gradient text-white heat-pulse">
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Light It Up"
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-400 mb-1">Didn't receive the code?</p>
                <button
                  onClick={handleResendOtp}
                  className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Resend Hot Code
                </button>
              </div>
            </div>
          )}

          <div className="footer-text">
            <p>
              Already have an account?{" "}
              <a href="/login">
                Bring the heat
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterForm
