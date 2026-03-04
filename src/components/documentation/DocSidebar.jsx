// src/components/documentation/DocSidebar.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { nhost } from "../../lib/nhost";
import { useRole } from "../../context/RoleContext";

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildUniqueSlug = (baseSlug, usedSlugs) => {
  if (!usedSlugs.has(baseSlug)) return baseSlug;
  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;
  while (usedSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
  return candidate;
};

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
  const [freeDocPosition, setFreeDocPosition] = useState("middle");
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

  const migrateFreeDocSlugs = useCallback(async (freeDocsList) => {
    const slugMap = new Map();
    const usedSlugs = new Set(freeDocsList.map((doc) => doc.slug));

    freeDocsList.forEach((doc) => {
      if (!doc?.slug || !doc?.title || slugMap.has(doc.slug)) return;

      const normalizedBaseSlug = slugify(doc.title);
      if (!normalizedBaseSlug || normalizedBaseSlug === doc.slug) return;

      usedSlugs.delete(doc.slug);
      const nextSlug = buildUniqueSlug(normalizedBaseSlug, usedSlugs);
      usedSlugs.add(nextSlug);
      slugMap.set(doc.slug, nextSlug);
    });

    if (!slugMap.size) return false;

    for (const [oldSlug, newSlug] of slugMap.entries()) {
      await nhost.graphql.request({
        query: `
          mutation UpdateFreeDocSlug($oldSlug: String!, $newSlug: String!) {
            update_documentation(
              where: {
                _and: [
                  { slug: { _eq: $oldSlug } }
                  { component_id: { _is_null: true } }
                ]
              }
              _set: { slug: $newSlug }
            ) {
              affected_rows
            }
          }
        `,
        variables: { oldSlug, newSlug },
      });
    }

    return true;
  }, []);

  const fetchSidebarData = useCallback(async (allowMigration = true) => {
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
              id
              slug
              title
              position
            }
          }
        `,
      });

      const allComponents = res.body.data.components || [];
      const docs = res.body.data.documentation || [];
      const ids = new Set(docs.map((doc) => doc.component_id));
      const compsWithoutDoc = allComponents.filter((comp) => !ids.has(comp.id));
      const free = res.body.data.documentation_free || [];

      if (canEdit && allowMigration) {
        const hasMigrated = await migrateFreeDocSlugs(free);
        if (hasMigrated) {
          await fetchSidebarData(false);
          return;
        }
      }

      setComponents(allComponents);
      setDocumentedIds(ids);
      setFreeDocs(free);
      setSelectedNewComponentId(compsWithoutDoc[0]?.id || "");
    } catch (err) {
      console.error("Erreur fetching sidebar documentation:", err);
    }
  }, [canEdit, migrateFreeDocSlugs]);

  useEffect(() => {
    fetchSidebarData();
  }, [fetchSidebarData]);

  const toggleFolder = (title) => {
    setOpenFolders((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleCreateFreeDocumentation = async () => {
    if (!freeDocTitle.trim()) return;

    try {
      const slug = slugify(freeDocTitle);

      await nhost.graphql.request({
        query: `
          mutation InsertFreeDoc($slug: String!, $title: String!, $type: String!, $content: String!, $position: String) {
            insert_documentation_one(object: {
              slug: $slug,
              title: $title,
              type: $type,
              content: $content,
              position: $position
            }) {
              id
            }
          }
        `,
        variables: {
          slug,
          title: freeDocTitle,
          type: freeDocType || "introduction",
          content: "Documentation à compléter.",
          position: freeDocPosition === "middle" ? null : freeDocPosition,
        },
      });

      setAddingDoc(false);
      setFreeDocTitle("");
      setFreeDocType("introduction");
      setFreeDocPosition("middle");
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

  const handleUpdateFreeDocPosition = async (docId, nextPosition) => {
    try {
      await nhost.graphql.request({
        query: `
          mutation UpdateFreeDocPosition($id: uuid!, $position: String) {
            update_documentation_by_pk(pk_columns: {id: $id}, _set: {position: $position}) {
              id
              position
            }
          }
        `,
        variables: {
          id: docId,
          position: nextPosition === "middle" ? null : nextPosition,
        },
      });
      await fetchSidebarData();
    } catch (err) {
      console.error("Erreur update free doc position:", err);
    }
  };

  const renderFreeDocsSection = (list, options = {}) => {
    if (!list.length) return null;
    const { showTopBorder = true, showBottomBorder = false } = options;
    return (
      <div
        style={{
          marginTop: "1.5rem",
          borderTop: showTopBorder ? "1px solid #2f2f2f" : "none",
          borderBottom: showBottomBorder ? "1px solid #2f2f2f" : "none",
          paddingTop: showTopBorder ? "1rem" : "0",
          paddingBottom: showBottomBorder ? "1rem" : "0",
        }}
      >
        {list.map((doc) => {
          const isActive = location.pathname.endsWith(`/${doc.slug}`);
          return (
            <div key={doc.slug} style={{ marginBottom: "0.3rem", display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <Link
                to={`/documentation/${doc.slug}`}
                className={isActive ? "doc-sidebar-link doc-sidebar-link-active" : "doc-sidebar-link"}
                style={{
                  textDecoration: "none",
                  fontWeight: isActive ? "bold" : "normal",
                  flex: 1,
                }}
                onClick={() => {
                  if (isMobile) setIsOpen(false);
                }}
              >
                {doc.title}
              </Link>
              {canEdit && (
                <select
                  value={doc.position || "middle"}
                  onChange={(e) => handleUpdateFreeDocPosition(doc.id, e.target.value)}
                  style={{
                    background: "#1a1a1a",
                    color: "white",
                    border: "1px solid #333",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    padding: "0.15rem 0.3rem",
                  }}
                >
                  <option value="top">Haut</option>
                  <option value="middle">Milieu</option>
                  <option value="bottom">Bas</option>
                </select>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const freeDocsTop = freeDocs.filter((doc) => doc.position === "top");
  const freeDocsMiddle = freeDocs.filter((doc) => !doc.position || doc.position === "middle");
  const freeDocsBottom = freeDocs.filter((doc) => doc.position === "bottom");


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
                    <select
                      value={freeDocPosition}
                      onChange={(e) => setFreeDocPosition(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.4rem",
                        borderRadius: "4px",
                        border: "1px solid #444",
                        background: "#1a1a1a",
                        color: "white",
                        marginTop: "0.4rem",
                      }}
                    >
                      <option value="top">Placer en haut</option>
                      <option value="middle">Placer au milieu</option>
                      <option value="bottom">Placer en bas</option>
                    </select>
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

        {renderFreeDocsSection(freeDocsTop, {
          showTopBorder: false,
          showBottomBorder: true,
        })}

        {freeDocsTop.length > 0 && (
          <div style={{ marginTop: "0.8rem" }} />
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
                          className={isActive ? "doc-sidebar-link doc-sidebar-link-active" : "doc-sidebar-link"}
                          style={{
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

        {renderFreeDocsSection(freeDocsMiddle, {
          showTopBorder: true,
          showBottomBorder: true,
        })}
        {renderFreeDocsSection(freeDocsBottom, {
          showTopBorder: true,
          showBottomBorder: false,
        })}
      </div>
    </>
  );
}

export default DocSidebar;
