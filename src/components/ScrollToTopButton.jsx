import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      className={`scroll-top-btn ${visible ? "show" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Torna in alto"
    >
      <FontAwesomeIcon icon={faArrowUp} />
    </button>
  );
}
