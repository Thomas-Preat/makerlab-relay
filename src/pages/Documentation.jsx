import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tabs from "../components/documentation/Tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Documentation() {
  const { category, slug } = useParams(); // category = dossier parent, slug = nom de l’élément
  const [mdContent, setMdContent] = useState({});

  useEffect(() => {
    const files = ["explication", "schema", "librairie"];
    const fetchFiles = async () => {
      const content = {};
      for (const file of files) {
        try {
          // construit automatiquement le chemin
          const path = `/docs/${category}/${slug}/${file}.md`;
          const res = await fetch(path);
          content[file] = await res.text();
        } catch (err) {
          content[file] = `# ${file} non trouvé`;
        }
      }
      setMdContent(content);
    };
    fetchFiles();
  }, [category, slug]);

  const tabsData = [
    {
      label: "Explication",
      content: <div className="doc-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{mdContent.explication}</ReactMarkdown></div>
    },
    {
      label: "Schéma",
      content: <div className="doc-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{mdContent.schema}</ReactMarkdown></div>
    },
    {
      label: "Librairie",
      content: <div className="doc-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{mdContent.librairie}</ReactMarkdown></div>
    }
  ];

  return <Tabs tabs={tabsData} />;
}