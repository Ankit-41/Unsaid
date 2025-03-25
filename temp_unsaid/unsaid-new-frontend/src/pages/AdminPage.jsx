"use client"

import { useState } from "react"
import { FaChartBar, FaUsers, FaPepperHot, FaFire } from "react-icons/fa"
import Footer from "../components/layout/Footer"

import AdminUsers from "../components/admin/AdminUsers"
import AdminPosts from "../components/admin/AdminPosts"

// Add this to your global CSS or component
const adminPageStyles = `
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-slide-in {
  animation: fadeSlideIn 0.3s ease-out forwards;
}

.spicy-gradient {
  background: linear-gradient(135deg, #b71c1c, #ff3d00);
}

.spicy-bg {
  background-color: #1a1a1a;
  // background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 10c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zM15 40c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5zm30 0c5 0 5 0 5 5s0 5-5 5-5 0-5-5 0-5 5-5z' fill='%23ff3d00' fillOpacity='0.05' fillRule='evenodd'/%3E%3C/svg%3E");
}

@keyframes heatPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 61, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 61, 0, 0); }
}

.heat-pulse {
  animation: heatPulse 2s infinite;
}
`

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <>
      <style>{adminPageStyles}</style>
      <div className="min-h-screen spicy-bg p-2 flex flex-col">
        <header className="mb-6 mt-3  text-center">
          <div className="inline-flex items-center justify-center mb-2">
            <FaFire className="text-red-500 text-4xl mr-3 heat-pulse" />
            <h1 className="text-3xl  font-bold text-white bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">
              Spicy Gossip Admin
            </h1>
          </div>
          <p className="text-gray-400">Manage the hottest gossip on the network</p>
        </header>

        <nav className="flex justify-center space-x-4 border-b border-gray-800 pb-2 mb-6">
          {/* <button
            className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
              activeTab === "dashboard"
                ? "spicy-gradient text-white shadow-md"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaChartBar className={`mr-2 ${activeTab === "dashboard" ? "text-white" : "text-red-500"}`} />
            Dashboard
          </button> */}
          <button
            className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
              activeTab === "users"
                ? "spicy-gradient text-white shadow-md"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <FaUsers className={`mr-2 ${activeTab === "users" ? "text-white" : "text-red-500"}`} />
            Users
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
              activeTab === "posts"
                ? "spicy-gradient text-white shadow-md"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            <FaPepperHot className={`mr-2 ${activeTab === "posts" ? "text-white" : "text-red-500"}`} />
            Posts
          </button>
        </nav>

        <div className="fade-slide-in flex-grow">
          {/* {activeTab === "dashboard" && <Dashboard />} */}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "posts" && <AdminPosts />}
        </div>
        <Footer />
      </div>
    </>
  )
}

export default AdminPage
