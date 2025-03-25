import RegisterForm from "../components/auth/RegisterForm"
import { FaFire, FaPepperHot } from "react-icons/fa"

// Add this to your global CSS or component
const registerPageStyles = `
@keyframes flameFlicker {
  0% { transform: scale(0.97); opacity: 0.8; }
  50% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(0.97); opacity: 0.8; }
}

.flame-flicker {
  animation: flameFlicker 3s infinite;
}

@keyframes floatChili {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

.float-chili {
  animation: floatChili 6s ease-in-out infinite;
}

.spicy-gradient {
  background: linear-gradient(135deg, #b71c1c, #ff3d00);
}

.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #121212;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 61, 0, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 61, 0, 0.05) 0%, transparent 50%);
  padding: 1rem;
}

.content-container {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
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

.badges-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-red {
  background-color: rgba(185, 28, 28, 0.3);
  color: #fecaca;
}

.badge-dark {
  background-color: rgba(31, 41, 55, 0.8);
  color: #e5e7eb;
}

.footer-text {
  text-align: center;
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 1.5rem;
}
`

function RegisterPage() {
  return (
    <>
      <style>{registerPageStyles}</style>
      <div className="page-container">
        <div className="content-container">
          <div className="logo-container">
            <div className="relative inline-block">
              <FaFire className="text-red-500 text-5xl flame-flicker" />
              <FaPepperHot className="text-red-600 text-2xl absolute -right-3 -bottom-1 float-chili" />
            </div>
            <h1 className="app-title">Unsaid</h1>
            <p className="app-subtitle">Join the spiciest gossip network</p>
            <div className="badges-container">
              <span className="badge badge-red">
                <FaFire className="mr-1" /> 100% Anonymous
              </span>
              <span className="badge badge-dark">
                <FaPepperHot className="mr-1" /> Extra Spicy
              </span>
            </div>
          </div>

          <RegisterForm />

          <div className="footer-text">
            <p>By creating an account, you agree to our spicy terms and conditions.</p>
            <p className="mt-1">Your identity is protected unless you choose to reveal it.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterPage

