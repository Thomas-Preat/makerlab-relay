import { Link } from "react-router-dom";
import { useRole } from "../../context/RoleContext";

function Navbar() {
  const { role, setRole } = useRole();
  const isTeacher = role === "teacher";

  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/inventory">Inventaire</Link>
      {isTeacher && <Link to="/admin">Admin</Link>}
      <button onClick={() => setRole(role === "teacher" ? "student" : "teacher")}>
        Switch Role (actuel: {role})
      </button>
    </nav>
  );
}

export default Navbar;