import DocSidebar from "./DocSidebar";
import { Outlet } from "react-router-dom";

function DocLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DocSidebar />
      <div style={{
        flex: 1,
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <Outlet />
      </div>
    </div>
  );
}

export default DocLayout;