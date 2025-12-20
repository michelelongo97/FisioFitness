import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      // se siamo già in home scrolla in alto
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // altrimenti se siamo in privacy / cookie allora torna alla home
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
      />
    </header>
  );
}
