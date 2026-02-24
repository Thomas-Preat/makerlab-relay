// src/pages/Documentation.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { nhost } from "../lib/nhost";
import Tabs from "../components/documentation/Tabs"; // shared component

export default function Documentation() {
  const { slug } = useParams(); // pour la route dynamique
  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [tabsContent, setTabsContent] = useState({
    Explication: "",
    Schéma: "",
    Librairie: "",
  });

  // Récupérer tous les composants
  useEffect(() => {
    async function fetchComponents() {
      try {
        const res = await nhost.graphql.request({
          query: `
            query {
              components(order_by: {name: asc}) {
                id
                name
                slug
                category
              }
            }
          `,
        });
        const comps = res.body.data.components || [];
        setComponents(comps);

        // Sélection par slug de l'URL
        if (slug) {
          const comp = comps.find((c) => c.slug === slug);
          if (comp) setSelectedComponentId(comp.id);
        }
      } catch (err) {
        console.error("Erreur fetching components:", err);
      }
    }

    fetchComponents();
  }, [slug]);

  // Récupérer le Markdown pour le composant sélectionné
  useEffect(() => {
    if (!selectedComponentId) return;
    async function fetchDocumentation() {
      try {
        const res = await nhost.graphql.request({
          query: `
            query GetDocumentation($component_id: uuid!) {
              documentation(where: {component_id: {_eq: $component_id}}) {
                type
                content
              }
            }
          `,
          variables: { component_id: selectedComponentId },
        });

        const docs = res.body.data.documentation || [];

        // base contenant toutes les clés attendues
        const contentObj = {
          Explication: "",
          Schéma: "",
          Librairie: "",
        };

        // on normalise les types retournés par la base
        const keyMap = {
          explication: "Explication",
          sch\u00e9ma: "Schéma",
          schema: "Schéma",        // parfois sans accent
          librairie: "Librairie",
        };

        docs.forEach((doc) => {
          if (doc.type) {
            const key = keyMap[doc.type.toLowerCase()];
            if (key) {
              contentObj[key] = doc.content;
            }
          }
        });
        setTabsContent(contentObj);
      } catch (err) {
        console.error("Erreur fetching documentation:", err);
      }
    }

    fetchDocumentation();
  }, [selectedComponentId]);

  // Sauvegarder le contenu modifié : met à jour localement puis sur la DB
  const handleSave = async (key, newContent) => {
    setTabsContent((prev) => ({ ...prev, [key]: newContent }));

    // mappe la clé affichée vers le type stocké en base
    const reverseKeyMap = {
      Explication: "explication",
      Schéma: "schema",
      Librairie: "librairie",
    };

    const dbType = reverseKeyMap[key] || key.toLowerCase();

    try {
      // vérifier si une entrée existe déjà
      const q = `query GetDoc($component_id: uuid!, $type: String!) {
        documentation(where: {component_id: {_eq: $component_id}, type: {_eq: $type}}) {
          id
        }
      }`;

      const res = await nhost.graphql.request({
        query: q,
        variables: { component_id: selectedComponentId, type: dbType },
      });

      const docs = res.body.data.documentation || [];

      if (docs.length) {
        // mise à jour
        const docId = docs[0].id;
        const m = `mutation UpdateDoc($id: uuid!, $content: String!) {
          update_documentation_by_pk(pk_columns: {id: $id}, _set: {content: $content}) { id }
        }`;

        await nhost.graphql.request({ query: m, variables: { id: docId, content: newContent } });
      } else {
        // insertion
        const m2 = `mutation InsertDoc($component_id: uuid!, $type: String!, $content: String!) {
          insert_documentation_one(object: { component_id: $component_id, type: $type, content: $content }) { id }
        }`;

        await nhost.graphql.request({ query: m2, variables: { component_id: selectedComponentId, type: dbType, content: newContent } });
      }
    } catch (err) {
      console.error("Erreur saving documentation:", err);
    }
  };

  return (
    <div className="doc-content" style={{ padding: "1rem", flex: 1 }}>
      {!selectedComponentId && (
        <div>Bienvenue sur la documentation. Sélectionnez un composant dans la sidebar.</div>
      )}

      {selectedComponentId && (
        <Tabs
          contentObj={tabsContent}
          onSave={(key, newContent) => {
            setTabsContent((prev) => ({ ...prev, [key]: newContent }));
            // TODO: persister côté serveur si nécessaire
            console.log("Saved tab", key);
          }}
        />
      )}
    </div>
  );
}