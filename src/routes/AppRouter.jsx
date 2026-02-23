import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Inventory from "../pages/Inventory";
import Dashboard from "../pages/Dashboard";
import DocLayout from "../components/documentation/DocLayout";
import Documentation from "../pages/Documentation";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/documentation" element={<DocLayout />}>
        {/* Page dynamique : category = dossier, slug = élément */}
        <Route path=":category/:slug" element={<Documentation />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;