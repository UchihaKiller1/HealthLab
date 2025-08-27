import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/adminDashboard";
import Register from "./pages/user/register";
import Login from "./pages/user/login";
import AboutUs from "./pages/user/aboutUs";
import Profile from "./pages/user/Profile";
import EditProfile from "./pages/user/EditProfile";
import ChangePasswordPage from "./pages/user/ChangePasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
