import { useState, useEffect } from "react";
import { useRole } from "../context/RoleContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, user } = useRole();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const err = await login(email, password);
    if (err) {
      setError(err.message || "Échec de la connexion");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (user) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Vous êtes déjà connecté en tant que {user.email} ({user.displayName || ""}).</p>
        <button onClick={() => navigate("/")}>Retourner à l'accueil</button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div style={{
          position: "fixed",
          top: 10,
          right: 10,
          background: "rgba(255,0,0,0.9)",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: 4,
          zIndex: 1000,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ maxWidth: 300, margin: "2rem auto" }}>
        <h2>Connexion professeur</h2>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
        </div>
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Se connecter
        </button>
      </form>
    </>
  );
}
