import { BrowserRouter,Route,Routes } from "react-router-dom"
import AdminDashboard from "./pages/admin/adminDashboard"
import Register from "./pages/user/register"
import Login from "./pages/user/login"
import AboutUs from "./pages/user/aboutUs"
function App() {
 return(
    <BrowserRouter>
    <Routes path='/*'>
      <Route path="/admin" element={<AdminDashboard></AdminDashboard>}></Route>
      <Route path="/register" element={<Register></Register>}></Route>
      <Route path="/login" element={<Login></Login>}></Route>
      <Route path="/about" element={<AboutUs></AboutUs>}></Route>
    </Routes>

  </BrowserRouter>


 )
}

export default App
