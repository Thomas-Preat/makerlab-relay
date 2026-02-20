import { useRole } from "../context/RoleContext";

function Login() {
  const { setRole } = useRole();

  const handleStudent = () => setRole("student");
  const handleTeacher = () => setRole("teacher");

  return (
    <div className="container">
      <h1>Login (simulé)</h1>
      <button onClick={handleStudent}>Se connecter comme élève</button>
      <button onClick={handleTeacher}>Se connecter comme professeur</button>
    </div>
  );
}

export default Login;