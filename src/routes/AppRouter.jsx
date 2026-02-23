import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Inventory from "../pages/Inventory";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/inventory" element={<Inventory />} />
    </Routes>
  );
}

export default AppRouter;