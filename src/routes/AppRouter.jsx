import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import DocLayout from "../components/documentation/DocLayout";
import Documentation from "../pages/Documentation";
import Login from "../pages/Login";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inventory" element={<Inventory />} />

      <Route path="/documentation" element={<DocLayout />}>
        {/* Page d'accueil de la doc */}
        <Route index element={<div>Bienvenue sur la documentation ! Sélectionnez un composant dans la sidebar.</div>} />
        {/* Page dynamique modulaire (liée ou libre) */}
        <Route path=":slug" element={<Documentation />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;