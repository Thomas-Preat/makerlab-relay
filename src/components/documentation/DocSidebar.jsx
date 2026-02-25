// src/components/documentation/DocSidebar.jsx
import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { nhost } from "../../lib/nhost";
import { useRole } from "../../context/RoleContext";

function DocSidebar() {
  const { role } = useRole();
  const canEdit = role === "teacher" || role === "admin";
  const location = useLocation();
  const navigate = useNavigate();

  const [components, setComponents] = useState([]);
  const [documentedIds, setDocumentedIds] = useState(new Set());
  const [openFolders, setOpenFolders] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [addingDoc, setAddingDoc] = useState(false);
  const [selectedNewComponentId, setSelectedNewComponentId] = useState("");
  const [addMode, setAddMode] = useState("linked");
  const [newDocType, setNewDocType] = useState("explication");
  const [freeDocTitle, setFreeDocTitle] = useState("");
  const [freeDocType, setFreeDocType] = useState("introduction");
  const [freeDocs, setFreeDocs] = useState([]);

  const documentedComponents = useMemo(
    () => components.filter((comp) => documentedIds.has(comp.id)),
    [components, documentedIds]
  );

  const undocumentedComponents = useMemo(
    () => components.filter((comp) => !documentedIds.has(comp.id)),
    [components, documentedIds]
  );

  const componentsByCategory = useMemo(() => {
    return documentedComponents.reduce((acc, comp) => {
      const category = comp.category || "Autres";
      if (!acc[category]) acc[category] = [];
      acc[category].push(comp);
      return acc;
    }, {});
  }, [documentedComponents]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchSidebarData = async () => {
    try {
      const res = await nhost.graphql.request({
        query: `
          query SidebarData {
            components(order_by: { name: asc }) {
              id
              name
              slug
              category
            }
            documentation(where: {component_id: {_is_null: false}}, distinct_on: component_id) {
              component_id
            }
            documentation_free: documentation(where: {component_id: {_is_null: true}}, order_by: {title: asc}) {
              slug
              title
            }
          }
        `,
      });

      const allComponents = res.body.data.components || [];
      const docs = res.body.data.documentation || [];
      const ids = new Set(docs.map((doc) => doc.component_id));
      const compsWithoutDoc = allComponents.filter((comp) => !ids.has(comp.id));
      const free = res.body.data.documentation_free || [];

      setComponents(allComponents);
      setDocumentedIds(ids);
      setFreeDocs(free);
      setSelectedNewComponentId(compsWithoutDoc[0]?.id || "");
    } catch (err) {
      console.error("Erreur fetching sidebar documentation:", err);
    }
  };

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const toggleFolder = (title) => {
    setOpenFolders((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleCreateFreeDocumentation = async () => {
    if (!freeDocTitle.trim()) return;

    try {
      const slug = freeDocTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      await nhost.graphql.request({
        query: `
          mutation InsertFreeDoc($slug: String!, $title: String!, $type: String!, $content: String!) {
            insert_documentation_one(object: {
              slug: $slug,
              title: $title,
              type: $type,
              content: $content
            }) {
              id
            }
          }
        `,
        variables: { 
          slug, 
          title: freeDocTitle, 
          type: freeDocType || "introduction",
          content: "Documentation à compléter." 
        },
      });

      setAddingDoc(false);
      setFreeDocTitle("");
      setFreeDocType("introduction");
      setAddMode("linked");
      navigate(`/documentation/${slug}`);
      await fetchSidebarData();
      if (isMobile) setIsOpen(false);
    } catch (err) {
      console.error("Erreur lors de la création de la documentation libre :", err);
    }
  };

  const handleCreateDocumentation = async () => {
    if (!selectedNewComponentId) return;

    const selectedComponent = components.find((comp) => comp.id === selectedNewComponentId);
    if (!selectedComponent) return;

    try {
      await nhost.graphql.request({
        query: `
          mutation InsertDocStarter($slug: String!, $component_id: uuid!, $type: String!) {
            insert_documentation_one(object: {
              slug: $slug,
              component_id: $component_id,
              type: $type,
              content: "Documentation à compléter."
            }) {
              id
            }
          }
        `,
        variables: { 
          slug: selectedComponent.slug,
          component_id: selectedComponent.id,
          type: newDocType || "explication"
        },
      });

      await fetchSidebarData();
      setAddingDoc(false);
      setNewDocType("explication");
      navigate(`/documentation/${selectedComponent.slug}`);
      if (isMobile) setIsOpen(false);
    } catch (err) {
      console.error("Erreur lors de la création de la documentation :", err);
    }
  };


  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "fixed",
            top: "1rem",
            left: "1rem",
            zIndex: 1001,
            background: "#4ea8de",
            color: "white",
            border: "none",
            padding: "0.5rem 0.8rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      )}

      <div
        style={{
          transform: isMobile ? (isOpen ? "translateX(0)" : "translateX(-280px)") : "translateX(0)",
          transition: "transform 0.3s ease",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          height: "100vh",
          width: "250px",
          background: "#111",
          color: "white",
          padding: "1rem",
          zIndex: 1000,
          overflowY: "auto",
        }}
      >
        {canEdit && (
          <div style={{ marginBottom: "1rem", borderBottom: "1px solid #2f2f2f", paddingBottom: "0.8rem" }}>
            <button
              onClick={() => setAddingDoc((prev) => !prev)}
              style={{
                width: "100%",
                background: "#4ea8de",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "0.5rem 0.6rem",
                cursor: "pointer",
              }}
            >
              {addingDoc ? "Annuler" : "Ajouter une documentation"}
            </button>

            {addingDoc && (
              <div style={{ marginTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={() => setAddMode("linked")}
                    style={{
                      flex: 1,
                      padding: "0.3rem 0.4rem",
                      background: addMode === "linked" ? "#4ea8de" : "#333",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Composant
                  </button>
                  <button
                    onClick={() => setAddMode("free")}
                    style={{
                      flex: 1,
                      padding: "0.3rem 0.4rem",
                      background: addMode === "free" ? "#4ea8de" : "#333",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Libre
                  </button>
                </div>

                {addMode === "linked" ? (
                  <>
                    <select
                      value={selectedNewComponentId}
                      onChange={(e) => setSelectedNewComponentId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.4rem",
                        borderRadius: "4px",
                        border: "1px solid #444",
                        background: "#1a1a1a",
                        color: "white",
                      }}
                    >
                      {undocumentedComponents.length === 0 ? (
                        <option value="">Tous les composants ont déjà une documentation</option>
                      ) : (
                        undocumentedComponents.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name}
                          </option>
                        ))
                      )}
                    </select>

                    <input
                      type="text"
                      placeholder="Type: explication, schema, librairie..."
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value.toLowerCase().trim())}
                      style={{
                        width: "100%",
                        padding: "0.4rem",
                        borderRadius: "4px",
                        border: "1px solid #444",
                        background: "#1a1a1a",
                        color: "white",
                        marginTop: "0.4rem",
                      }}
                    />

                    <button
                      onClick={handleCreateDocumentation}
                      disabled={undocumentedComponents.length === 0 || !selectedNewComponentId}
                      style={{
                        background: undocumentedComponents.length === 0 ? "#666" : "#2ea043",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.45rem 0.6rem",
                        cursor: undocumentedComponents.length === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      Créer et ouvrir
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Ex: Introduction, Guide de démarrage..."
                      value={freeDocTitle}
                      onChange={(e) => setFreeDocTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.4rem",
                        borderRadius: "4px",
                        border: "1px solid #444",
                        background: "#1a1a1a",
                        color: "white",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Type: introduction, guide, faq..."
                      value={freeDocType}
                      onChange={(e) => setFreeDocType(e.target.value.toLowerCase().trim())}
                      style={{
                        width: "100%",
                        padding: "0.4rem",
                        borderRadius: "4px",
                        border: "1px solid #444",
                        background: "#1a1a1a",
                        color: "white",
                        marginTop: "0.4rem",
                      }}
                    />
                    <button
                      onClick={handleCreateFreeDocumentation}
                      disabled={!freeDocTitle.trim()}
                      style={{
                        background: !freeDocTitle.trim() ? "#666" : "#2ea043",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.45rem 0.6rem",
                        cursor: !freeDocTitle.trim() ? "not-allowed" : "pointer",
                      }}
                    >
                      Créer et ouvrir
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {Object.keys(componentsByCategory).length === 0 ? (
          <div style={{ color: "#bbb", fontSize: "0.9rem" }}>
            Aucune documentation disponible pour le moment.
          </div>
        ) : (
          Object.entries(componentsByCategory).map(([category, comps]) => (
            <div key={category} style={{ marginBottom: "1rem" }}>
              <div
                onClick={() => toggleFolder(category)}
                style={{ cursor: "pointer", fontWeight: "bold" }}
              >
                {category} {openFolders[category] ? "▼" : "▶"}
              </div>

              {openFolders[category] && (
                <div style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                  {comps.map((comp) => {
                    const isActive = location.pathname.endsWith(`/${comp.slug}`);
                    return (
                      <div key={comp.id} style={{ marginBottom: "0.3rem" }}>
                        <Link
                          to={`/documentation/${comp.slug}`}
                          style={{
                            color: isActive ? "#4ea8de" : "white",
                            textDecoration: "none",
                            fontWeight: isActive ? "bold" : "normal",
                          }}
                          onClick={() => {
                            if (isMobile) setIsOpen(false);
                          }}
                        >
                          {comp.name}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}

        {freeDocs.length > 0 && (
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #2f2f2f", paddingTop: "1rem" }}>
            <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Documentation libre</div>
            {freeDocs.map((doc) => {
              const isActive = location.pathname.endsWith(`/${doc.slug}`);
              return (
                <div key={doc.slug} style={{ marginBottom: "0.3rem" }}>
                  <Link
                    to={`/documentation/${doc.slug}`}
                    style={{
                      color: isActive ? "#4ea8de" : "white",
                      textDecoration: "none",
                      fontWeight: isActive ? "bold" : "normal",
                    }}
                    onClick={() => {
                      if (isMobile) setIsOpen(false);
                    }}
                  >
                    {doc.title}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default DocSidebar;
