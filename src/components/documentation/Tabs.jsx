import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // tables, strikethrough, task lists, etc.

const sanitizeBaseName = (rawName) => {
  const fallback = "snippet";
  if (!rawName || typeof rawName !== "string") return fallback;

  const normalized = rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
};

function MarkdownCodeBlock({ className, children, downloadBaseName, ...props }) {
  const [copyState, setCopyState] = useState("idle");
  const match = /language-(\w+)/.exec(className || "");
  const language = (match?.[1] || "text").toLowerCase();
  const rawCode = String(children || "").replace(/\n$/, "");
  const canDownloadPython = language === "python" || language === "py";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch (_err) {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 1400);
    }
  };

  const handleDownload = () => {
    const baseName = sanitizeBaseName(downloadBaseName || document.title || "python-snippet");
    const fileName = `${baseName}.py`;
    const blob = new Blob([rawCode], { type: "text/x-python;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="doc-code-block">
      <div className="doc-code-toolbar">
        <span className="doc-code-language">{language}</span>
        <div className="doc-code-actions">
          <button type="button" className="doc-code-btn" onClick={handleCopy}>
            {copyState === "copied" ? "Copie" : copyState === "failed" ? "Erreur" : "Copier"}
          </button>
          {canDownloadPython && (
            <button type="button" className="doc-code-btn" onClick={handleDownload}>
              Telecharger .py
            </button>
          )}
        </div>
      </div>
      <pre>
        <code className={className} {...props}>
          {rawCode}
        </code>
      </pre>
    </div>
  );
}

function MarkdownPre({ children, downloadBaseName }) {
  const codeChild = Array.isArray(children) ? children[0] : children;
  const codeProps = codeChild?.props || {};

  return (
    <MarkdownCodeBlock className={codeProps.className} downloadBaseName={downloadBaseName}>
      {codeProps.children}
    </MarkdownCodeBlock>
  );
}

function Tabs({ tabs = {}, onSave, canEdit = false, onAddType, onDeleteType, onRenameType, onMoveType, newTypeName = "", onNewTypeNameChange, downloadBaseName = "" }) {
  const tabKeys = Object.keys(tabs || {}); // array of types
  const [activeTab, setActiveTab] = useState(tabKeys[0] || "");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [renameSourceType, setRenameSourceType] = useState(null);
  const [renameValue, setRenameValue] = useState("");

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
  const requestRename = (type) => {
    if (!onRenameType) return;
    setRenameSourceType(type);
    setRenameValue(type);
  };

  const cancelRename = () => {
    setRenameSourceType(null);
    setRenameValue("");
  };

  const confirmRename = () => {
    if (!renameSourceType) return;
    onRenameType(renameSourceType, renameValue);
    cancelRename();
  };

  return (
    <div style={{ border: "1px dashed rgba(78,168,222,0.25)", padding: "0.5rem", borderRadius: 6 }}>
      {/* Display tabs only if more than one */}
      {!hasSingleTab && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          {tabKeys.map((type, index) => (
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
                <>
                  <button
                    onClick={() => onMoveType && onMoveType(type, "up")}
                    disabled={index === 0}
                    style={{
                      padding: "0.3rem 0.45rem",
                      background: index === 0 ? "#555" : "#444",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      fontSize: "0.85rem",
                    }}
                    title="Monter cet onglet"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onMoveType && onMoveType(type, "down")}
                    disabled={index === tabKeys.length - 1}
                    style={{
                      padding: "0.3rem 0.45rem",
                      background: index === tabKeys.length - 1 ? "#555" : "#444",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: index === tabKeys.length - 1 ? "not-allowed" : "pointer",
                      fontSize: "0.85rem",
                    }}
                    title="Descendre cet onglet"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => requestRename(type)}
                    style={{
                      padding: "0.3rem 0.45rem",
                      background: "#444",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                    title="Renommer cet onglet"
                  >
                    ✎
                  </button>
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
                </>
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
            onClick={() => requestRename(activeTab)}
            style={{ padding: "0.4rem 0.8rem", background: "#444", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            Renommer l'onglet
          </button>
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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            pre({ children }) {
              return <MarkdownPre downloadBaseName={downloadBaseName}>{children}</MarkdownPre>;
            },
          }}
        >
          {tabs[activeTab]}
        </ReactMarkdown>
      </div>

      {renameSourceType && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              color: "white",
              padding: "1.2rem",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.35)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Renommer l'onglet</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename();
                if (e.key === "Escape") cancelRename();
              }}
              autoFocus
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #444",
                background: "#0d1117",
                color: "white",
                boxSizing: "border-box",
              }}
            />
            <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
              <button
                onClick={cancelRename}
                style={{ padding: "0.45rem 0.9rem", background: "#666", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                onClick={confirmRename}
                style={{ padding: "0.45rem 0.9rem", background: "#4ea8de", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Renommer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tabs;