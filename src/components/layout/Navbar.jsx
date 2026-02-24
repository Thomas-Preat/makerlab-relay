import { Link, useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";

function Navbar() {
  const { role, user, logout } = useRole();
  const navigate = useNavigate();

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
        {user ? (
          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            style={{ background: "#e04e4e", border: "none", padding: "0.4rem 0.8rem", borderRadius: 4, cursor: "pointer", color: "white" }}
          >
            Déconnexion
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={{ background: "#4ea8de", border: "none", padding: "0.4rem 0.8rem", borderRadius: 4, cursor: "pointer", color: "white" }}
          >
            Login prof
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;