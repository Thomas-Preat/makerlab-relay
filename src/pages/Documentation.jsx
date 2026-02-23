import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

function Documentation() {
  const { slug } = useParams();
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/docs/${slug}.md`)
      .then(res => res.text())
      .then(text => setContent(text));
  }, [slug]);

  return (
    <div className="doc-content">
        <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        >
        {content}
        </ReactMarkdown>
    </div>
    );
}

export default Documentation;