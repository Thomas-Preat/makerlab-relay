import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // tables, strikethrough, task lists, etc.

function Tabs({ contentObj = {}, onSave, canEdit = false }) {
  const tabs = Object.keys(contentObj || {}); // ensure we have an array
  const [activeTab, setActiveTab] = useState(tabs[0] || "");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (tabs.length && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  // mettre à jour le texte d'édition quand l'onglet change
  useEffect(() => {
    setEditText(contentObj[activeTab] || "");
  }, [activeTab, contentObj]);

  if (!tabs.length) {
    return <p>Aucun onglet à afficher.</p>;
  }

  const handleSave = () => {
    if (onSave) onSave(activeTab, editText);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditText(contentObj[activeTab] || "");
    setEditing(false);
  };

  return (
    <div style={{ border: "1px dashed rgba(78,168,222,0.25)", padding: "0.5rem", borderRadius: 6 }}>
      {/* Boutons des onglets */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.5rem 1rem",
              background: activeTab === tab ? "#4ea8de" : "#ccc",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
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

      {/* Contenu Markdown actif */}
      <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "4px" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentObj[activeTab]}</ReactMarkdown>
      </div>
    </div>
  );
}

export default Tabs;