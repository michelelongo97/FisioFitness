import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const loggedIn = isLoggedIn();

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".main-header");
      const heroHeight = window.innerHeight;

      if (window.scrollY > heroHeight - 100) {
        header.classList.add("hidden");
      } else {
        header.classList.remove("hidden");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // chiudi il menu ad ogni cambio pagina
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogoClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <header className={`main-header ${menuOpen ? "menu-open" : ""}`}>
      <img
        src="/images/logos/logo.png"
        alt="FisioFitness"
        className="logo"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      />

      <button
        className="nav-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Apri menu"
      >
        <span className={menuOpen ? "bar1-open" : ""}></span>
        <span className={menuOpen ? "bar2-open" : ""}></span>
        <span className={menuOpen ? "bar3-open" : ""}></span>
      </button>

      <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/reel">Video</Link>
        {loggedIn ? (
          <>
            <Link to="/prenota">Prenota SALA</Link>
            <Link to="/prenota-corso">Prenota CORSO</Link>
            <Link to="/area-personale">Area personale</Link>
          </>
        ) : (
          <Link to="/login">Accedi</Link>
        )}
      </nav>
    </header>
  );
}
