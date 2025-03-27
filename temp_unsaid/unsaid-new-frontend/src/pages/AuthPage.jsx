"use client"

import { useState } from "react"
import { FaFire, FaPepperHot } from "react-icons/fa"
import LoginForm from "../components/auth/LoginForm"
import RegisterForm from "../components/auth/RegisterForm"
import unsaidLogo from '../assets/unsaidLogo.png';

import   { motion } from "framer-motion"

// Add this to your global CSS or component
const authPageStyles = `
@keyframes flameFlicker {
  0% { transform: scale(0.97); opacity: 0.8; }
  50% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(0.97); opacity: 0.8; }
}

.flame-flicker {
  animation: flameFlicker 3s infinite;
}

.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0A0A0C;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 61, 0, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 61, 0, 0.05) 0%, transparent 50%);
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 1;
}

.logo-container {
  margin-bottom: 1.5rem;
  text-align: center;
}

.app-title {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(to right, #ff3d00, #ffab00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-top: 0.5rem;
}

.app-subtitle {
  color: #d1d5db;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: rgba(185, 28, 28, 0.3);
  color: #fecaca;
  margin-top: 0.75rem;
  transition: all 0.3s ease;
}

.badge:hover {
  transform: translateY(-2px);
  background-color: rgba(185, 28, 28, 0.4);
  box-shadow: 0 5px 15px rgba(185, 28, 28, 0.2);
}

.footer-text {
  text-align: center;
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 1.5rem;
}

.toggle-container {
  display: flex;
  background-color: rgba(31, 41, 55, 0.5);
  border-radius: 9999px;
  padding: 0.25rem;
  margin-bottom: 2rem;
  position: relative;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.toggle-button {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.875rem;
  color: #d1d5db;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.toggle-button.active {
  color: white;
}

.toggle-slider {
  position: absolute;
  top: 0.25rem;
  height: calc(100% - 0.5rem);
  border-radius: 9999px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.form-container {
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.form-container.entering {
  animation: formEnter 0.4s forwards;
}

.form-container.exiting {
  animation: formExit 0.4s forwards;
}

@keyframes formEnter {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes formExit {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* Background elements */
.bg-element {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  z-index: 0;
}

.bg-element-1 {
  top: 10%;
  left: 15%;
  width: 30rem;
  height: 30rem;
  background: #ff3d00;
  animation: pulse 8s infinite alternate;
}

.bg-element-2 {
  bottom: 10%;
  right: 15%;
  width: 25rem;
  height: 25rem;
  background: #b71c1c;
  animation: pulse 10s infinite alternate-reverse;
}

@keyframes pulse {
  0% {
    opacity: 0.1;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.2;
    transform: scale(1.05);
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .content-container {
    padding: 1rem 0.75rem;
    justify-content: flex-start;
    padding-top: 2rem;
  }
  
  .logo-container {
    margin-bottom: 1rem;
  }
  
  .app-title {
    font-size: 1.75rem;
  }
  
  .app-subtitle {
    font-size: 0.875rem;
  }
  
  .toggle-container {
    margin-bottom: 1.5rem;
  }
  
  .toggle-button {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  
  .bg-element-1, .bg-element-2 {
    width: 15rem;
    height: 15rem;
  }
}
`

function AuthPage() {
  const [activeForm, setActiveForm] = useState("login")
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationClass, setAnimationClass] = useState("")

  const toggleForm = (form) => {
    if (form === activeForm) return

    setIsAnimating(true)
    setAnimationClass("exiting")

    setTimeout(() => {
      setActiveForm(form)
      setAnimationClass("entering")

      setTimeout(() => {
        setIsAnimating(false)
        setAnimationClass("")
      }, 400)
    }, 300)
  }

  // Calculate toggle slider position
  const getSliderStyle = () => {
    return {
      left: activeForm === "login" ? "0.25rem" : "50%",
      width: "calc(50% - 0.5rem)",
      background: "linear-gradient(135deg, #b71c1c, #ff3d00)",
    }
  }

  return (
    <>
      <style>{authPageStyles}</style>
      <div className="page-container">
        {/* Background elements */}
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>

        <div className="content-container">
          <div className="logo-container">
            <div className="relative inline-block">

              <motion.div
                className="flex justify-center mb-6 flame-flicker"
               
              >
                <div className="relative inline-block">
                  <div className="relative bg-gradient-to-b from-gray-700/40 to-red-700/20 p-3 rounded-full backdrop-blur-md ">
                    <img src={unsaidLogo} alt="Logo" className="w-16 h-16 object-contain" />
                  </div>
                </div>

              </motion.div>



            </div>




            <h1 className="app-title">UNSAID</h1>
            <p className="app-subtitle">
              {activeForm === "login" ? "Where the hottest gossip burns brightest" : "Join the spiciest gossip network"}
            </p>
            <div className="flex justify-center">
              <span className="badge">
                <FaFire className="mr-1" /> 100% Anonymous
              </span>
            </div>
          </div>

          {/* Form toggle */}
          <div className="toggle-container">
            <div className="toggle-slider" style={getSliderStyle()}></div>
            <button
              className={`toggle-button ${activeForm === "login" ? "active" : ""}`}
              onClick={() => toggleForm("login")}
            >
              Sign In
            </button>
            <button
              className={`toggle-button ${activeForm === "register" ? "active" : ""}`}
              onClick={() => toggleForm("register")}
            >
              Sign Up
            </button>
          </div>

          {/* Form container */}
          <div className={`form-container ${animationClass}`}>
            {activeForm === "login" ? <LoginForm /> : <RegisterForm />}
          </div>

          <div className="footer-text">
            <p>
              {activeForm === "login"
                ? "By signing in, you agree to our spicy terms and conditions."
                : "By creating an account, you agree to our spicy terms and conditions."}
            </p>
            <p className="mt-1">Your identity is protected unless you choose to reveal it.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthPage

