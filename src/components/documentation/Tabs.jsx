import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // tables, strikethrough, task lists, etc.

function Tabs({ tabs = {}, onSave, canEdit = false, onAddType, onDeleteType, newTypeName = "", onNewTypeNameChange }) {
  const tabKeys = Object.keys(tabs || {}); // array of types
  const [activeTab, setActiveTab] = useState(tabKeys[0] || "");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // Format type names: "explication" → "Explication", "schema" → "Schema", etc.
  const formatTabName = (type) => {
    const typeMap = {
      explication: "Explication",
      schema: "Schéma",
      schéma: "Schéma",
      librairie: "Librairie",
    };
    return typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  useEffect(() => {
    if (tabKeys.length && !tabKeys.includes(activeTab)) {
      setActiveTab(tabKeys[0]);
    }
  }, [tabKeys, activeTab]);

  // Update edit text when tab changes
  useEffect(() => {
    setEditText(tabs[activeTab] || "");
  }, [activeTab, tabs]);

  if (!tabKeys.length) {
    return <p>Aucun onglet à afficher.</p>;
  }

  const handleSave = () => {
    if (onSave) onSave(activeTab, editText);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditText(tabs[activeTab] || "");
    setEditing(false);
  };

  const hasSingleTab = tabKeys.length === 1;

  return (
    <div style={{ border: "1px dashed rgba(78,168,222,0.25)", padding: "0.5rem", borderRadius: 6 }}>
      {/* Display tabs only if more than one */}
      {!hasSingleTab && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          {tabKeys.map((type) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <button
                onClick={() => setActiveTab(type)}
                style={{
                  padding: "0.5rem 1rem",
                  background: activeTab === type ? "#4ea8de" : "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {formatTabName(type)}
              </button>
              {canEdit && (
                <button
                  onClick={() => onDeleteType && onDeleteType(type)}
                  style={{
                    padding: "0.3rem 0.5rem",
                    background: "#d32f2f",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                  }}
                  title="Supprimer cette section"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {canEdit && (
            <button
              onClick={() => setEditing((s) => !s)}
              style={{ marginLeft: "auto", padding: "0.4rem 0.8rem", background: "#222", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
            >
              {editing ? "Fermer" : "Éditer"}
            </button>
          )}
        </div>
      )}

      {/* Single tab: display edit button differently */}
      {hasSingleTab && canEdit && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={() => setEditing((s) => !s)}
            style={{ padding: "0.4rem 0.8rem", background: "#222", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            {editing ? "Fermer" : "Éditer"}
          </button>
        </div>
      )}

      {/* Add new type section */}
      {canEdit && onAddType && (
        <div style={{ marginBottom: "1rem", padding: "0.6rem", background: "#1a1a1a", borderRadius: "4px", display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Nouveau type (ex: voltage, compatibilité...)"
            value={newTypeName}
            onChange={(e) => onNewTypeNameChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onAddType()}
            style={{
              flex: 1,
              padding: "0.4rem",
              borderRadius: "3px",
              border: "1px solid #444",
              background: "#0d1117",
              color: "white",
            }}
          />
          <button
            onClick={onAddType}
            disabled={!newTypeName.trim()}
            style={{
              padding: "0.4rem 0.8rem",
              background: !newTypeName.trim() ? "#666" : "#2ea043",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: !newTypeName.trim() ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + Ajouter
          </button>
        </div>
      )}

      {editing && canEdit ? (
        <div style={{ marginBottom: "1rem" }}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={12}
            style={{ width: "100%", padding: "0.6rem", borderRadius: 6, border: "1px solid #ddd", background: "#0d1117", color: "#d7d7d7" }}
          />
          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <button onClick={handleSave} style={{ padding: "0.4rem 0.8rem", background: "#4ea8de", border: "none", borderRadius: 4, cursor: "pointer" }}>Enregistrer</button>
            <button onClick={handleCancel} style={{ padding: "0.4rem 0.8rem", background: "#ccc", border: "none", borderRadius: 4, cursor: "pointer" }}>Annuler</button>
          </div>
        </div>
      ) : null}

      {/* Active content display */}
      <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "4px" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{tabs[activeTab]}</ReactMarkdown>
      </div>
    </div>
  );
}

export default Tabs;