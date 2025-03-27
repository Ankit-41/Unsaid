import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import PostsPage from './pages/PostsPage';
import AdminDashboard from './pages/AdminPage';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/layout/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

// Main Layout with Navbar
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

// Auth Layout without Navbar
function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

function App() {
  // Check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Check if user is an admin
  const isAdmin = () => {
    try {
      const userJSON = localStorage.getItem('user');
      console.log('User JSON from localStorage:', userJSON);

      if (!userJSON) {
        console.log('No user found in localStorage');
        return false;
      }

      const user = JSON.parse(userJSON);
      console.log('Parsed user object:', user);
      console.log('User role:', user.role);

      return user && user.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Protected route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }

    if (adminOnly && !isAdmin()) {
      return <Navigate to="/posts" />;
    }

    return children;
  };

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth routes - no navbar */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Main routes with navbar */}
        {/* <Route path="/" element={<MainLayout />}>
          <Route 
            path="posts" 
            element={
              <ProtectedRoute>
                <PostsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="" element={<Navigate to="/posts" />} />
        </Route> */}

        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="posts" element={
            <ProtectedRoute>
              <PostsPage />
            </ProtectedRoute>
          } />
          <Route path="" element={<Navigate to="/" />} />
        </Route>


        {/* Admin routes - has its own navbar */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/posts" />} />
      </Routes>
    </Router>
  );
}

export default App;
