import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/adminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import Register from "./pages/user/register";
import Login from "./pages/user/login";
import AboutUs from "./pages/user/aboutUs";
import Profile from "./pages/user/Profile";
import EditProfile from "./pages/user/EditProfile";
import ChangePasswordPage from "./pages/user/ChangePasswordPage";
import CreateExperiment from "./pages/user/CreateExperiment";
import Home from "./pages/user/Home";
import Explore from "./pages/user/Explore";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/experiments/new" element={<CreateExperiment />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
