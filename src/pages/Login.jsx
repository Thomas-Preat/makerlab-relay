// Login page without role context (simulated). Replace with real auth later.

function Login() {
  // no role state

  return (
    <div className="container">
      <h1>Login (simulé)</h1>
      <button onClick={handleStudent}>Se connecter comme élève</button>
      <button onClick={handleTeacher}>Se connecter comme professeur</button>
    </div>
  );
}

export default Login;