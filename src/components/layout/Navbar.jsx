import { NavLink, useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";

function Navbar() {
  const { user, logout } = useRole();
  const navigate = useNavigate();
  const navClassName = ({ isActive }) =>
    isActive ? "app-navbar-link app-navbar-link-active" : "app-navbar-link";

  return (
    <nav className="app-navbar">
      <NavLink to="/" end className={navClassName}>
        Dashboard
      </NavLink>
      <NavLink to="/inventory" className={navClassName}>
        Inventaire
      </NavLink>
      <NavLink to="/orders" className={navClassName}>
        Commandes
      </NavLink>
      <NavLink to="/documentation" className={navClassName}>
        Documentation
      </NavLink>
      <NavLink to="/testnhost" className={navClassName}>
        Test Nhost
      </NavLink>
      <div className="app-navbar-auth">
        {user ? (
          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            className="app-navbar-btn app-navbar-btn-logout"
          >
            Déconnexion
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="app-navbar-btn app-navbar-btn-login"
          >
            Login prof
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;