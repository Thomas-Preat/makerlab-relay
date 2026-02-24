import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "1rem", background: "#222", color: "white" }}>
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
    </nav>
  );
}

export default Navbar;