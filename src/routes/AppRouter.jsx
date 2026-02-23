import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Inventory from "../pages/Inventory";
import Dashboard from "../pages/Dashboard";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} />
    </Routes>
  );
}

export default AppRouter;