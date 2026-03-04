import { useEffect, useState } from "react";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 220);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      className="scroll-top-btn"
      aria-label="Revenir en haut de la page"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}

export default ScrollToTopButton;
