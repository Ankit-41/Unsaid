import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom } from './atoms/authAtom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Post Pages
import Home from './pages/posts/Home';
import MyPosts from './pages/posts/MyPosts';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';

// Protected Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [auth] = useAtom(authAtom);
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (auth.user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* App Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="my-posts" element={<MyPosts />} />
          
          {/* Admin Routes */}
          <Route 
            path="admin" 
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } 
          />
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
