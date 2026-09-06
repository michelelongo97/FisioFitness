import { useEffect, useState } from "react";
import { getConsent, setConsent } from "../lib/cookieConsent";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  const handleChoice = (value) => {
    setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        Questo sito utilizza cookie tecnici necessari al funzionamento. Nella
        pagina "Video" sono presenti contenuti Instagram che, se attivati,
        installano cookie di terze parti di Meta. Consulta la{" "}
        <Link to="/cookie-policy">Cookie Policy</Link> per maggiori
        informazioni.
      </p>
      <div className="cookie-banner-actions">
        <button
          className="btn"
          style={{ margin: 0, padding: "10px 24px", fontSize: 14 }}
          onClick={() => handleChoice("accepted")}
        >
          Accetta
        </button>
        <button
          className="btn-danger"
          style={{ margin: 0, padding: "10px 24px", fontSize: 14 }}
          onClick={() => handleChoice("rejected")}
        >
          Rifiuta
        </button>
      </div>
    </div>
  );
}
