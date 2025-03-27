"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "../../services/api"
import toast from "react-hot-toast"
import { FaEnvelope, FaLock, FaUser, FaUserPlus, FaSpinner, FaKey, FaArrowLeft, FaFire, FaEye, FaEyeSlash } from "react-icons/fa"

// Add this to your global CSS or component
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

.otp-input {
  letter-spacing: 0.25em;
  text-align: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  color: #f87171;
  transition: all 0.2s;
  position: relative;
}

.back-button:hover {
  color: #ef4444;
  transform: translateX(-3px);
}

.back-button::before {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #ef4444;
  transition: width 0.3s ease;
}

.back-button:hover::before {
  width: 100%;
}

.verification-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.verification-icon::after {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 9999px;
  background: linear-gradient(45deg, #b71c1c, #ff3d00);
  z-index: -1;
  filter: blur(8px);
  opacity: 0.7;
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
  
  .form-label {
    font-size: 0.8rem;
  }
}
`

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [otp, setOtp] = useState("")
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  // Validate email is from IITR domain
  const validateEmail = (email) => {
    const emailLower = email.toLowerCase()
    if (!emailLower.endsWith("iitr.ac.in")) {
      return "Email must be from IITR domain (iitr.ac.in)"
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validate email
    const emailError = validateEmail(formData.email)
    if (emailError) {
      setErrors({ ...errors, email: emailError })
      toast.error("Only IITR email addresses are valid", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
      setLoading(false)
      return
    }

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
      // Verify email with OTP
      await authAPI.verifyEmail({
        email: formData.email,
        otp,
      })
      
      // After successful verification, automatically log in the user
      const loginResponse = await authAPI.login({
        email: formData.email,
        password: formData.password
      })
      
      toast.success("Account created and logged in! Time to spill some tea!", {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
      
      // Navigate to posts page instead of login page
      navigate("/posts")
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <>
      <style>{registerFormStyles}</style>
      <div className="register-form">
        <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
          <div className="p-5 bg-gray-900">
            {!showOtpForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="form-label">
                    Display Name
                  </label>
                  <div className="relative">
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
                      placeholder="Where to send the hot gossip"
                      required
                      className="form-input"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
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
                      placeholder="Create a spicy password"
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
                    Make it hot! At least 8 characters with letters, numbers, and symbols.
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
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your spicy password"
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
              <div className="space-y-5 spicy-entrance">
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

                <form onSubmit={handleOtpSubmit} className="space-y-4">
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
                        className="form-input otp-input"
                        maxLength={6}
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
                        Verifying...
                      </>
                    ) : (
                      "Light It Up"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Didn't receive the code?</p>
                  <button
                    onClick={handleResendOtp}
                    className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors form-link"
                  >
                    Resend Hot Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterForm
