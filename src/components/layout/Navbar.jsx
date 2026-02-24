import { Link } from "react-router-dom";
import { useRole } from "../../context/RoleContext";

function Navbar() {
  const { role, setRole } = useRole();

  return (
    <nav style={{ padding: "1rem", background: "#222", color: "white", display: "flex", alignItems: "center" }}>
      <Link to="/" style={{ marginRight: "1rem", color: "white" }}>
        Dashboard
      </Link>
      <Link to="/inventory" style={{ marginRight: "1rem", color: "white" }}>
        Inventaire
      </Link>
      <Link to="/orders" style={{ color: "white" }}>
        Commandes
      </Link>
      <Link to="/documentation" style={{ marginLeft: "1rem", color: "white" }}>
        Documentation
      </Link>
      <Link to="/testnhost" style={{ marginLeft: "1rem", color: "white" }}>
        Test Nhost
      </Link>
      <div style={{ marginLeft: "auto" }}>
        {role !== "teacher" ? (
          <button
            onClick={() => setRole("teacher")}
            style={{ background: "#4ea8de", border: "none", padding: "0.4rem 0.8rem", borderRadius: 4, cursor: "pointer", color: "white" }}
          >
            Login prof
          </button>
        ) : (
          <button
            onClick={() => setRole("student")}
            style={{ background: "#e04e4e", border: "none", padding: "0.4rem 0.8rem", borderRadius: 4, cursor: "pointer", color: "white" }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;