import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const docs = [
  {
    title: "Accéléromètre",
    children: [
      { title: "ACL", slug: "accelerometre/ACL" },
      { title: "ACL2", slug: "accelerometre/ACL2" },
      { title: "ACL Maison", slug: "accelerometre/ACL-Maison" }
    ]
  },
  {
    title: "Affichage",
    children: [
      { title: "LCD PC1602F", slug: "affichage/LCD-PC1602F" },
      { title: "LCD Pmod", slug: "affichage/LCD-Pmod" }
    ]
  },
  {
    title: "Input Devices",
    children: [
      { title: "Clavier 16 boutons", slug: "input-devices/clavier-16-boutons" }
    ]
  }
];

function DocSidebar() {
  const [openFolders, setOpenFolders] = useState({});
  const [isOpen, setIsOpen] = useState(false); // sidebar mobile
  const [isMobile, setIsMobile] = useState(false);

  // Détecte la largeur de la fenêtre
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // vérifie au premier render
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          transform: isMobile
            ? isOpen
              ? "translateX(0)"
              : "translateX(-280px)"
            : "translateX(0)",
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
        {docs.map((folder) => (
          <div key={folder.title} style={{ marginBottom: "1rem" }}>
            <div
              onClick={() => toggleFolder(folder.title)}
              style={{ cursor: "pointer", fontWeight: "bold" }}
            >
              {folder.title} {openFolders[folder.title] ? "▼" : "▶"}
            </div>

            {openFolders[folder.title] && (
              <div style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                {folder.children.map((doc) => (
                  <div key={doc.slug} style={{ marginBottom: "0.3rem" }}>
                    <Link
                      to={`/documentation/${doc.slug}`}
                      style={{ color: "white", textDecoration: "none" }}
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      {doc.title}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default DocSidebar;