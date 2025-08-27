import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/adminDashboard";
import Register from "./pages/user/register";
import Login from "./pages/user/login";
import Profile from "./pages/user/Profile";
import EditProfile from "./pages/user/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes path="/*">
        <Route
          path="/admin"
          element={<AdminDashboard></AdminDashboard>}
        ></Route>
        <Route path="/register" element={<Register></Register>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/profile" element={<Profile></Profile>}></Route>
        <Route
          path="/edit-profile"
          element={<EditProfile></EditProfile>}
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
