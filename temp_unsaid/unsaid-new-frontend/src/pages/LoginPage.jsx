import LoginForm from "../components/auth/LoginForm"
import { FaFire, FaPepperHot } from "react-icons/fa"

// Add this to your global CSS or component
const loginPageStyles = `
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

.chili-pattern {
  background-color: #1a1a1a;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zM15 40c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5z' fill='%23ff3d00' fillOpacity='0.05' fillRule='evenodd'/%3E%3C/svg%3E");
}
`

function LoginPage() {
  return (
    <>
      <style>{loginPageStyles}</style>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 chili-pattern">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <FaFire className="text-red-500 text-6xl flame-flicker" />
                <FaPepperHot className="text-red-600 text-3xl absolute -right-4 -bottom-2 float-chili" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">
              Unsaid
            </h1>
            <p className="mt-2 text-xl text-gray-300">Where the hottest gossip burns brightest</p>
            <div className="mt-3 flex justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-900 text-red-100">
                <FaFire className="mr-1" /> 100% Anonymous
              </span>
            </div>
          </div>

          <LoginForm />

          <div className="text-center text-sm text-gray-500">
            <p>By signing in, you agree to our spicy terms and conditions.</p>
            <p className="mt-1">We never reveal your identity unless you choose to.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage

