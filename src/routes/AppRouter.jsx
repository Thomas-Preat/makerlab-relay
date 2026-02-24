import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import DocLayout from "../components/documentation/DocLayout";
import Documentation from "../pages/Documentation";
import Login from "../pages/Login";

// Composants récupérés depuis Nhost
import { useEffect, useState } from "react";
import { nhost } from "../lib/nhost";

function AppRouter() {
  const [components, setComponents] = useState([]);

  useEffect(() => {
    async function fetchComponents() {
      const res = await nhost.graphql.request({
        query: `
          query {
            components(order_by: { name: asc }) {
              id
              name
              slug
              category
            }
          }
        `
      });
      setComponents(res.body.data.components || []);
    }
    fetchComponents();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inventory" element={<Inventory />} />

      <Route path="/documentation" element={<DocLayout components={components} />}>
        {/* Page d'accueil de la doc */}
        <Route index element={<div>Bienvenue sur la documentation ! Sélectionnez un composant dans la sidebar.</div>} />
        {/* Page dynamique pour un composant */}
        <Route path=":category/:slug" element={<Documentation />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;