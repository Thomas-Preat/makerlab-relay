// src/pages/TestNhost.jsx
import { useEffect, useState } from "react";

export default function TestNhost() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://dixqumruorjuqiurcfpz.hasura.eu-central-1.nhost.run/v1/graphql",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Si tu utilises l'auth Nhost, ajoute le token ici
              // "Authorization": `Bearer ${process.env.REACT_APP_NHOST_AUTH_TOKEN}`,
            },
            body: JSON.stringify({
              query: `
                query {
                  components {
                    id
                    name
                  }
                }
              `,
            }),
          }
        );

        const result = await response.json();

        if (result.errors) {
          setError(result.errors);
        } else {
          setData(result.data.components);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {JSON.stringify(error)}</div>;

  return (
    <div>
      <h1>Liste des composants</h1>
      <ul>
        {data.map((component) => (
          <li key={component.id}>{component.name} - {component.description}</li>
        ))}
      </ul>
    </div>
  );
}