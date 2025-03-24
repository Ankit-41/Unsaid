"use client"

import { useState } from "react"
import { FaPepperHot } from "react-icons/fa"
import PostModal from "./PostModal"

// Add this to your global CSS or component
const composeButtonStyles = `
@keyframes spicyPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 61, 0, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(255, 61, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 61, 0, 0); }
}

.spicy-pulse {
  animation: spicyPulse 2s infinite;
}

@keyframes spicyRotate {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
}

.spicy-rotate:hover {
  animation: spicyRotate 0.5s ease-in-out;
}
`

const ComposeButton = () => {
  const [showModal, setShowModal] = useState(false)

  const handleOpenModal = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <>
      <style>{composeButtonStyles}</style>
      <button
        onClick={handleOpenModal}
        aria-label="Spill some hot gossip"
        className="fixed z-50 flex items-center justify-center spicy-pulse spicy-rotate"
        style={{
          bottom: "115px",
          right: "35px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #b71c1c, #ff3d00)",
          boxShadow: "0 4px 12px rgba(255, 61, 0, 0.3)",
        }}
      >
        <FaPepperHot size={28} className="text-white" />
      </button>
      {showModal && <PostModal show={showModal} handleClose={handleCloseModal} />}
    </>
  )
}

export default ComposeButton

