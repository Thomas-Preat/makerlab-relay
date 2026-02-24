import { Outlet } from "react-router-dom";
import DocSidebar from "./DocSidebar";

export default function DocLayout({ components }) {
  return (
    <div style={{ display: "flex" }}>
      <DocSidebar components={components} />
      <main style={{ flex: 1, padding: "1rem" }}>
        <Outlet /> {/* Affiche soit la page d'accueil, soit le composant Documentation */}
      </main>
    </div>
  );
}