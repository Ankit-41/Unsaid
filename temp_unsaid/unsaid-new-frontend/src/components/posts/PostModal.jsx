"use client"

import { useState, useEffect } from "react"
import { postsAPI } from "../../services/api"
import toast from "react-hot-toast"
import { FaTimes, FaFire, FaEye, FaEyeSlash, FaPepperHot } from "react-icons/fa"

// Add this to your global CSS or component
const modalStyles = `
@keyframes spicyEntrance {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulseHot {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes flameFlicker {
  0% { opacity: 0.8; transform: scale(0.97); }
  50% { opacity: 1; transform: scale(1.03); }
  100% { opacity: 0.8; transform: scale(0.97); }
}

.spicy-entrance {
  animation: spicyEntrance 0.4s ease-out forwards;
}

.pulse-hot {
  animation: pulseHot 1.5s infinite;
}

.flame-flicker {
  animation: flameFlicker 2s infinite;
}

.spicy-gradient {
  background: linear-gradient(135deg, #b71c1c, #ff3d00);
}

.modal-container {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.spicy-level-container {
  display: flex;
  gap: 0.5rem;
}

.spicy-level-button {
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  background-color: rgba(255, 255, 255, 0.05);
}

.spicy-level-button.active {
  background-color: rgba(255, 61, 0, 0.2);
  transform: scale(1.1);
}

.toggle-switch {
  position: relative;
  width: 40px;
  height: 20px;
  background-color: #4b5563;
  border-radius: 10px;
  transition: background-color 0.2s;
}

.toggle-switch.active {
  background-color: #b71c1c;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch.active::after {
  transform: translateX(20px);
}
`

const PostModal = ({ show, handleClose }) => {
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [spicyLevel, setSpicyLevel] = useState(1) // 1-5 spicy level

  const MAX_CHARS = 500
  const remainingChars = MAX_CHARS - content.length
  const isOverLimit = remainingChars < 0

  // Close modal with escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [handleClose])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error("Your gossip can't be empty!", {
        icon: "🌶️",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
      return
    }

    if (isOverLimit) {
      toast.error(`Whoa, too spicy! Keep it under ${MAX_CHARS} characters.`, {
        icon: "🔥",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
      return
    }

    setLoading(true)

    try {
      await postsAPI.createPost({
        content,
        isAnonymous,
        spicyLevel, // Add this to your API if you want to track spiciness
      })
      toast.success("Your hot gossip is waiting for approval!", {
        icon: "🌶️",
        style: { background: "#333", color: "#fff", border: "1px solid #4caf50" },
      })
      resetForm()
      handleClose()
    } catch (error) {
      console.error("Post creation error:", error)
      toast.error(error.response?.data?.message || "Failed to spill the tea. Try again!", {
        icon: "💔",
        style: { background: "#333", color: "#fff", border: "1px solid #ff3d00" },
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setContent("")
    setIsAnonymous(false)
    setSpicyLevel(1)
  }

  if (!show) return null

  return (
    <>
      <style>{modalStyles}</style>
      <div className="modal-container" onClick={handleClose}>
        <div className="modal-content spicy-entrance" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gray-900 border-b border-red-800">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-lg font-bold text-white flex items-center">
                <FaFire className="mr-2 text-red-500 flame-flicker" />
                <span>Spill the Hot Tea</span>
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-800 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 text-white">
            <div className="p-4">
              <textarea
                className={`w-full p-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-1 text-white placeholder-gray-500 text-base ${
                  isOverLimit ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-red-500"
                }`}
                placeholder="What's the juicy gossip? Don't hold back..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="4"
                required
              />

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">How spicy is this tea?</label>
                <div className="spicy-level-container mb-3">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSpicyLevel(level)}
                      className={`spicy-level-button ${spicyLevel >= level ? "active" : ""}`}
                      title={`Spicy level ${level}`}
                    >
                      <FaPepperHot
                        size={level === spicyLevel ? 20 : 16}
                        className={`${spicyLevel >= level ? "text-red-500" : "text-gray-500"} ${spicyLevel === level ? "pulse-hot" : ""}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-3">
                <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                  <div
                    className={`toggle-switch ${isAnonymous ? "active" : ""}`}
                    onClick={() => setIsAnonymous(!isAnonymous)}
                  ></div>
                  <span className="flex items-center">
                    {isAnonymous ? (
                      <>
                        <FaEyeSlash className="mr-1 text-red-500" /> Anonymous
                      </>
                    ) : (
                      <>
                        <FaEye className="mr-1" /> Show my name
                      </>
                    )}
                  </span>
                </label>

                <small
                  className={`text-xs font-medium ${
                    remainingChars <= 20 ? (remainingChars <= 0 ? "text-red-500" : "text-yellow-500") : "text-gray-400"
                  }`}
                >
                  {remainingChars} chars left
                </small>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900">
              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 relative overflow-hidden ${
                  loading || !content.trim() || isOverLimit
                    ? "bg-gray-700 cursor-not-allowed opacity-70"
                    : "spicy-gradient hover:opacity-90"
                }`}
                disabled={loading || !content.trim() || isOverLimit}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Spilling the tea...
                    </>
                  ) : (
                    <>
                      <FaFire className="mr-2" /> Spill the Tea
                    </>
                  )}
                </span>
              </button>

              <div className="mt-3 text-xs text-gray-500 flex items-center justify-center space-x-2">
                <FaFire className="text-red-500" />
                <span>Your gossip will be reviewed before it's served hot</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default PostModal

