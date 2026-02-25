// src/pages/Documentation.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { nhost } from "../lib/nhost";
import Tabs from "../components/documentation/Tabs"; // shared component
import { useRole } from "../context/RoleContext";

export default function Documentation() {
  const { slug } = useParams();
  const { role } = useRole();
  const canEdit = role === "teacher" || role === "admin";
  const [docTitle, setDocTitle] = useState("");
  const [componentId, setComponentId] = useState(null);
  const [tabs, setTabs] = useState({}); // {type: content}
  const [docIds, setDocIds] = useState({}); // {type: id} pour updates
  const [newTypeName, setNewTypeName] = useState("");
  const [deleteConfirmType, setDeleteConfirmType] = useState(null); // type à supprimer en attente de confirmation
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false); // confirmation suppression entière

  const hasDocumentation = Object.values(tabs).some(
    (value) => typeof value === "string" && value.trim() !== ""
  );

  // Fetch ALL documentation records for this slug
  useEffect(() => {
    if (!slug) return;

    async function fetchDocumentationBySlug() {
      try {
        const res = await nhost.graphql.request({
          query: `
            query GetDocBySlug($slug: String!) {
              documentation(where: {slug: {_eq: $slug}}) {
                id
                title
                component_id
                type
                content
              }
            }
          `,
          variables: { slug },
        });

        const docs = res.body.data.documentation || [];
        if (docs.length === 0) {
          setDocTitle("");
          setComponentId(null);
          setTabs({});
          setDocIds({});
          return;
        }

        // Build tabs object {type: content}
        const newTabs = {};
        const newDocIds = {};
        docs.forEach((doc) => {
          newTabs[doc.type] = doc.content || "";
          newDocIds[doc.type] = doc.id;
        });

        // Use title from DB, or slug as fallback
        setDocTitle(docs[0].title || slug);
        setComponentId(docs[0].component_id); // null or id
        setTabs(newTabs);
        setDocIds(newDocIds);
      } catch (err) {
        console.error("Erreur fetching documentation by slug:", err);
      }
    }

    fetchDocumentationBySlug();
  }, [slug]);

  const handleSave = async (type, newContent) => {
    setTabs((prev) => ({ ...prev, [type]: newContent }));

    try {
      if (docIds[type]) {
        // Update existing record
        const query = `
          mutation UpdateDoc($id: uuid!, $content: String!) {
            update_documentation_by_pk(pk_columns: {id: $id}, _set: {content: $content}) { 
              id 
            }
          }
        `;
        await nhost.graphql.request({
          query,
          variables: { id: docIds[type], content: newContent },
        });
      } else {
        // Insert new record for this type
        const query = `
          mutation InsertDoc($slug: String!, $type: String!, $content: String!, $component_id: uuid) {
            insert_documentation_one(object: {
              slug: $slug
              type: $type
              content: $content
              component_id: $component_id
              title: $title
            }) { 
              id 
            }
          }
        `;
        const res = await nhost.graphql.request({
          query,
          variables: {
            slug,
            type,
            content: newContent,
            component_id: componentId,
            title: docTitle,
          },
        });
        const newId = res.body.data.insert_documentation_one.id;
        setDocIds((prev) => ({ ...prev, [type]: newId }));
      }
    } catch (err) {
      console.error("Erreur saving documentation:", err);
    }
  };

  const handleAddType = async () => {
    if (!newTypeName.trim()) return;
    const cleanType = newTypeName.toLowerCase().trim();
    if (tabs[cleanType]) {
      alert("Ce type existe déjà");
      return;
    }

    try {
      const query = `
        mutation InsertDoc($slug: String!, $type: String!, $content: String!, $component_id: uuid, $title: String) {
          insert_documentation_one(object: {
            slug: $slug
            type: $type
            content: $content
            component_id: $component_id
            title: $title
          }) { 
            id 
          }
        }
      `;
      const res = await nhost.graphql.request({
        query,
        variables: {
          slug,
          type: cleanType,
          content: "",
          component_id: componentId,
          title: docTitle,
        },
      });
      const newId = res.body.data.insert_documentation_one.id;
      setTabs((prev) => ({ ...prev, [cleanType]: "" }));
      setDocIds((prev) => ({ ...prev, [cleanType]: newId }));
      setNewTypeName("");
    } catch (err) {
      console.error("Erreur adding type:", err);
    }
  };

  const handleDeleteType = async (type) => {
    if (!docIds[type]) return;
    setDeleteConfirmType(type); // Affiche le modal de confirmation
  };

  const confirmDeleteType = async () => {
    const type = deleteConfirmType;
    if (!type || !docIds[type]) return;

    try {
      const query = `
        mutation DeleteDoc($id: uuid!) {
          delete_documentation_by_pk(id: $id) { 
            id 
          }
        }
      `;
      await nhost.graphql.request({
        query,
        variables: { id: docIds[type] },
      });
      setTabs((prev) => {
        const newTabs = { ...prev };
        delete newTabs[type];
        return newTabs;
      });
      setDocIds((prev) => {
        const newIds = { ...prev };
        delete newIds[type];
        return newIds;
      });
    } catch (err) {
      console.error("Erreur deleting type:", err);
    } finally {
      setDeleteConfirmType(null); // Ferme le modal
    }
  };

  const confirmDeleteAll = async () => {
    try {
      // Delete ALL documentation records for this slug
      const query = `
        mutation DeleteAll($slug: String!) {
          delete_documentation(where: {slug: {_eq: $slug}}) {
            affected_rows
          }
        }
      `;
      await nhost.graphql.request({
        query,
        variables: { slug },
      });
      // Reset everything
      setDocTitle("");
      setComponentId(null);
      setTabs({});
      setDocIds({});
      setDeleteAllConfirm(false);
      // Navigate home
      window.location.href = "/documentation";
    } catch (err) {
      console.error("Erreur deleting all documentation:", err);
      setDeleteAllConfirm(false);
    }
  };

  return (
    <div className="doc-content" style={{ padding: "1rem", flex: 1 }}>
      {Object.keys(tabs).length === 0 && (
        <div>Bienvenue sur la documentation. Sélectionnez un élément dans la sidebar.</div>
      )}

      {Object.keys(tabs).length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>{docTitle}</h2>
            {canEdit && (
              <button
                onClick={() => setDeleteAllConfirm(true)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#cc0000",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                title="Supprimer entièrement cette documentation"
              >
                🗑️ Supprimer la doc
              </button>
            )}
          </div>
          {hasDocumentation || canEdit ? (
            <Tabs
              tabs={tabs}
              onSave={handleSave}
              canEdit={canEdit}
              onAddType={canEdit ? handleAddType : null}
              onDeleteType={canEdit ? handleDeleteType : null}
              newTypeName={newTypeName}
              onNewTypeNameChange={setNewTypeName}
            />
          ) : (
            <p>Pas encore de documentation ici.</p>
          )}
        </>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirmType && (
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
              padding: "1.5rem",
              borderRadius: "8px",
              maxWidth: "400px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer la section <strong>"{deleteConfirmType}"</strong> ?</p>
            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteConfirmType(null)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#666",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteType}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#d32f2f",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation suppression entière */}
      {deleteAllConfirm && (
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
              padding: "1.5rem",
              borderRadius: "8px",
              maxWidth: "400px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#ff6b6b" }}>⚠️ Supprimer entièrement</h3>
            <p>Êtes-vous sûr de vouloir supprimer <strong>toute la documentation</strong> de "<strong>{docTitle}</strong>" ?</p>
            <p style={{ color: "#ccc", fontSize: "0.9rem" }}>Cette action ne peut pas être annulée.</p>
            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteAllConfirm(false)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#666",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteAll}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#cc0000",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}