import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./pages/admin/adminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import Register from "./pages/user/register";
import Login from "./pages/user/login";
import AboutUs from "./pages/user/aboutUs";
import Profile from "./pages/user/Profile";
import EditProfile from "./pages/user/EditProfile";
import ChangePasswordPage from "./pages/user/ChangePasswordPage";
import CreateExperiment from "./pages/user/CreateExperiment";
import ExperimentDetails from "./pages/user/ExperimentDetails";
import Home from "./pages/user/Home";
import Explore from "./pages/user/Explore";
import CommunityFeed from "./pages/CommunityFeed";
import PublicProfile from "./pages/user/PublicProfile";
import Navbar from "./pages/user/component/Navbar";
import CrowdInsights from "./pages/CrowdInsights";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser?.role === 'admin' ? children : <Navigate to="/admin/login" />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/crowdinsights" element={<CrowdInsights />} />
          <Route path="/experiments/:id" element={<ExperimentDetails />} />
          <Route path="/user/:userId" element={<PublicProfile />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/experiments/new"
            element={
              <ProtectedRoute>
                <CreateExperiment />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer can be added here */}
      <footer className="bg-white shadow-inner py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HealthLab. All rights reserved.
          </p>
        </div>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
