import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogoClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <header className="main-header">
      <img
        src="/images/logos/logo.png"
        alt="FisioFitness"
        className="logo"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      />
    </header>
  );
}
