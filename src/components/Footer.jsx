import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebook,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* FOOTER TOP */}
        <div className="footer-top">
          {/* SOCIAL */}
          <div className="footer-col footer-social">
            <h4>Seguimi sui social</h4>
            <div className="social-icons">
              <a
                href={import.meta.env.VITE_SOCIAL_INSTAGRAM}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>

              <a
                href={import.meta.env.VITE_SOCIAL_FACEBOOK}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </a>

              <a
                href={import.meta.env.VITE_SOCIAL_LINKEDIN}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </div>
          </div>

          {/* INFO */}
          <div className="footer-col footer-info">
            <h4>Contatti</h4>

            <p>
              E-Mail:{" "}
              <a
                href={`mailto:${import.meta.env.VITE_EMAIL}`}
                className="footer-link"
              >
                {import.meta.env.VITE_EMAIL}
              </a>
            </p>

            <p>
              Tel:{" "}
              <a
                href={`tel:${import.meta.env.VITE_TEL}`}
                className="footer-link"
              >
                +39 {import.meta.env.VITE_TEL}
              </a>
            </p>
            <p>
              Via Palermo, 26
              <br />
              Gravina in Puglia (BA)
            </p>
          </div>

          {/* INFO */}
          <div className="footer-col footer-info">
            <h4>Informazioni</h4>
            <p>
              <strong>FisioFitness</strong>
            </p>
            <p>Dr. Costantino Picciallo</p>
            <p>P.IVA: 08494380721</p>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">
          <div className="footer-bottom-legal">
            <Link to="/privacy-policy" className="footer-link">
              Privacy Policy
            </Link>
            <span> | </span>
            <Link to="/cookie-policy" className="footer-link">
              Cookie Policy
            </Link>
          </div>
          <div className="footer-bottom-copy">
            © 2024 - {new Date().getFullYear()} FisioFitness | Tutti i diritti
            riservati
          </div>
        </div>
      </div>
    </footer>
  );
}
