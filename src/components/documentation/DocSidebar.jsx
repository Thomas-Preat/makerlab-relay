import { Link, useLocation } from "react-router-dom";

const docs = [
  { title: "ACL2", slug: "ACL2_Pmod" },
  { title: "Resistance 220 ohm", slug: "resistance-220" },
  { title: "Capteur HC-SR04", slug: "hc-sr04" }
];

function DocSidebar() {
  const location = useLocation();

  return (
    <div style={{
      width: "250px",
      background: "#111",
      color: "white",
      padding: "1rem"
    }}>
      <h2>Documentation</h2>
      {docs.map(doc => (
        <div key={doc.slug} style={{ marginBottom: "0.8rem" }}>
          <Link
            to={`/documentation/${doc.slug}`}
            style={{
              color:
                location.pathname.includes(doc.slug)
                  ? "#4ea8de"
                  : "white",
              textDecoration: "none"
            }}
          >
            {doc.title}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default DocSidebar;