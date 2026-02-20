import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Inventory from "../pages/Inventory";
import Dashboard from "../pages/Dashboard";
import Navbar from "../components/layout/Navbar";

function AppRouter() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRouter;