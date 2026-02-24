// src/components/documentation/DocSidebar.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function DocSidebar({ components = [], selectedComponent, onSelect }) {
  const [componentsByCategory, setComponentsByCategory] = useState({});
  const [openFolders, setOpenFolders] = useState({});
  const [isOpen, setIsOpen] = useState(false); // sidebar mobile
  const [isMobile, setIsMobile] = useState(false);


  // Détecter la largeur de la fenêtre
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Grouper les composants par catégorie
  useEffect(() => {
    if (!components || components.length === 0) return;

    const grouped = components.reduce((acc, comp) => {
      const cat = comp.category || "Autres";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(comp);
      return acc;
    }, {});

    setComponentsByCategory(grouped);
  }, [components]);

  const toggleFolder = (title) => {
    setOpenFolders({ ...openFolders, [title]: !openFolders[title] });
  };

  return (
    <>
      {/* Bouton hamburger visible uniquement sur mobile */}
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
            cursor: "pointer"
          }}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
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
          overflowY: "auto"
        }}
      >
        {Object.entries(componentsByCategory).map(([category, comps]) => (
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
                  const isActive = comp.id === selectedComponent;
                  return (
                    <div key={comp.id} style={{ marginBottom: "0.3rem" }}>
                      <Link
                        to={`/documentation/${comp.category}/${comp.slug}`}
                        style={{
                          color: isActive ? "#4ea8de" : "white",
                          textDecoration: "none",
                          fontWeight: isActive ? "bold" : "normal"
                        }}
                        onClick={() => {
                          if (onSelect) onSelect(comp.id);
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
        ))}
      </div>
    </>
  );
}

export default DocSidebar;