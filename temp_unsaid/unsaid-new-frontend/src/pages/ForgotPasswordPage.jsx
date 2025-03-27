import React from "react"
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm"

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-red-500/10 rounded-full filter blur-[150px] opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-orange-400/10 rounded-full filter blur-[150px] opacity-30 animate-pulse" />
      </div>
      
      <div className="z-10 w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

export default ForgotPasswordPage
