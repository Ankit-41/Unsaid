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
    setFormData({ ...formData, [name]: value })
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
      <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden w-full mx-auto transform transition-all hover:shadow-2xl border border-gray-800">
        <div className="spicy-gradient p-6">
          <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center">
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
          <p className="text-red-100 text-center mt-2">
            {showOtpForm ? "One step away from the juiciest gossip" : "Create your anonymous gossip profile"}
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-gray-900">
          {!showOtpForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-red-500" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="What should we call you?"
                    required
                    className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

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
                    placeholder="Where to send the hot gossip"
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
                    placeholder="Create a spicy password"
                    required
                    className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Make it hot! At least 8 characters with letters, numbers, and symbols.
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-red-500" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your spicy password"
                    required
                    className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white spicy-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-70 heat-pulse mt-6"
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
            <div className="space-y-6 spicy-entrance">
              <button
                onClick={goBackToRegister}
                className="flex items-center text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <FaArrowLeft className="mr-1" />
                Back to registration
              </button>

              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full spicy-gradient flex items-center justify-center">
                  <FaFire className="text-white text-xl" />
                </div>
              </div>

              <p className="text-center text-gray-300">
                We've sent a verification code to
                <br />
                <span className="font-medium text-red-400">{formData.email}</span>
              </p>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaKey className="text-red-500" />
                    </div>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the 6-digit code"
                      required
                      className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-center tracking-widest"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white spicy-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-70 heat-pulse"
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
                <p className="text-sm text-gray-400 mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResendOtp}
                  className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Resend Hot Code
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-red-400 hover:text-red-300 transition-colors">
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

