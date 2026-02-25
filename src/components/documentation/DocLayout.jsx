import { Outlet } from "react-router-dom";
import DocSidebar from "./DocSidebar";

export default function DocLayout() {
  return (
    <div style={{ display: "flex" }}>
      <DocSidebar />
      <main style={{ flex: 1, padding: "1rem" }}>
        <Outlet /> {/* Affiche soit la page d'accueil, soit le composant Documentation */}
      </main>
    </div>
  );
}