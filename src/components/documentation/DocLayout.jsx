import DocSidebar from "./DocSidebar";
import { Outlet } from "react-router-dom";

function DocLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DocSidebar /> {/* ta sidebar fixe avec dossiers et sous-éléments */}
      <div style={{ flex: 1, padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <Outlet /> {/* ici s’affiche la page Documentation dynamique */}
      </div>
    </div>
  );
}

export default DocLayout;