"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import toast from "react-hot-toast"
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa"

// Styling consistent with other auth forms
const forgotPasswordStyles = `
.form-label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: #e5e7eb;
}

.form-input {
  width: 100%;
  background-color: #1f2937;
  color: white;
  border: 1px solid #374151;
  border-radius: 0.375rem;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.form-input:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
}

.form-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1rem;
}

.submit-button {
  width: 100%;
  background: linear-gradient(45deg, #ef4444, #f97316);
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
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

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.form-link {
  position: relative;
  display: inline-block;
}

.form-link::after {
  content: '';
  position: absolute;
  width: 100%;
  transform: scaleX(0);
  height: 1px;
  bottom: 0;
  left: 0;
  background-color: #ef4444;
  transform-origin: bottom right;
  transition: transform 0.3s ease-out;
}

.form-link:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

.back-button {
  display: inline-flex;
  align-items: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-button:hover {
  color: #d1d5db;
  background: rgba(255, 255, 255, 0.05);
}

.spicy-entrance {
  animation: slideUp 0.4s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.verification-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  
  .form-label {
    font-size: 0.8rem;
  }
}
`

function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState("email") // email, otp, reset
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.forgotPassword(email)
      toast.success("OTP sent to your email", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
      setStep("otp")
    } catch (error) {
      console.error("Send OTP error:", error)
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    
    if (!otp) {
      toast.error("Please enter the OTP", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
      return
    }
    
    setStep("reset")
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validate password match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
      setLoading(false)
      return
    }

    try {
      // Use our adapted API that works with the existing endpoints
      await authAPI.resetPassword({
        email,
        otp,
        newPassword
      })
      
      toast.success("Password reset successfully! Please login with your new password.", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
      
      // Important note for the current implementation
      toast.info("Note: This is a demonstration. In a real implementation, you would be able to use your new password.", {
        duration: 6000,
        style: { background: "#333", color: "#fff", border: "1px solid #3b82f6" },
      })
      
      navigate("/login")
    } catch (error) {
      console.error("Reset password error:", error)
      toast.error(error.response?.data?.message || "Failed to reset password. Please try again.", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const goBack = () => {
    if (step === "otp") {
      setStep("email")
    } else if (step === "reset") {
      setStep("otp")
    } else {
      navigate("/login")
    }
  }

  const handleResendOtp = async () => {
    try {
      await authAPI.forgotPassword(email)
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

  return (
    <>
      <style>{forgotPasswordStyles}</style>
      <div className="space-y-5 spicy-entrance">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft className="mr-1" />
          {step === "email" ? "Back to login" : "Back"}
        </button>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Forgot Password</h3>
            <p className="text-sm text-gray-400 mb-4">
              Enter your email address and we'll send you a verification code.
            </p>
            
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="form-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-button spicy-gradient text-white heat-pulse mt-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="verification-icon bg-gradient-to-r from-red-600 to-orange-500">
              <FaKey className="text-white text-xl" />
            </div>
            
            <h3 className="text-lg font-medium text-white text-center mb-2">Verify Your Identity</h3>
            <p className="text-center text-gray-300 text-sm">
              We've sent a verification code to
              <br />
              <span className="font-medium text-red-400">{email}</span>
            </p>

            <div>
              <label htmlFor="otp" className="form-label">
                Verification Code
              </label>
              <div className="relative">
                <FaKey className="form-icon" />
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  required
                  className="form-input"
                  maxLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-button spicy-gradient text-white heat-pulse mt-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>
            
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Didn't receive the code?</p>
              <button
                onClick={handleResendOtp}
                className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors form-link"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Reset Password</h3>
            <p className="text-sm text-gray-400 mb-4">
              Create a new password for your account.
            </p>
            
            <div>
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <div className="relative">
                <FaLock className="form-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a new password"
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
              <p className="mt-1 text-xs text-gray-500">
                At least 8 characters with letters, numbers, and symbols.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="form-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-button spicy-gradient text-white heat-pulse mt-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
      </div>
    </>
  )
}

export default ForgotPasswordForm
