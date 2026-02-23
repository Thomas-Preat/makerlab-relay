import { useState } from "react";

function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Barre des onglets */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            style={{
              padding: "0.5rem 1rem",
              cursor: "pointer",
              background: active === idx ? "#4ea8de" : "#eee",
              color: active === idx ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu de l’onglet actif */}
      <div>{tabs[active].content}</div>
    </div>
  );
}

export default Tabs;