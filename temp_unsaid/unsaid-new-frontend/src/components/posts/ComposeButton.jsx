"use client"

import { useState } from "react"
import { FaPen } from "react-icons/fa"
import PostModal from "./PostModal"

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
      <button
        onClick={handleOpenModal}
        aria-label="Create new post"
        className="fixed z-50 flex items-center justify-center hover:shadow-2xl transition-transform duration-300"
        style={{
          bottom: "115px", // a bit higher
          right: "35px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        <FaPen size={24} className="text-white" />
      </button>
      {showModal && <PostModal show={showModal} handleClose={handleCloseModal} />}
    </>
  )
}

export default ComposeButton
