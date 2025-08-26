import { BrowserRouter,Route,Routes } from "react-router-dom"
import AdminDashboard from "./pages/admin/adminDashboard"
function App() {
 return(
    <BrowserRouter>
    <Routes path='/*'>
      <Route path="/admin" element={<AdminDashboard></AdminDashboard>}></Route>
    </Routes>

  </BrowserRouter>


 )
}

export default App
