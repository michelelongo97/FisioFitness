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

          {/* SPONSOR */}
          <div className="footer-col footer-sponsor">
            <h4>Partners</h4>
            <div className="sponsor-logos">
              <a
                href={import.meta.env.VITE_SPONSOR_MATERA_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/sponsor/matera-logo.png" alt="Matera" />
              </a>

              <a
                href={import.meta.env.VITE_SPONSOR_GIANNELLI_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/sponsor/giannelli-logo.png" alt="Giannelli" />
              </a>

              <a
                href={import.meta.env.VITE_SPONSOR_GALLERY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/sponsor/gallery-logo.png" alt="Gallery" />
              </a>

              <a
                href={import.meta.env.VITE_SPONSOR_INTERNO34_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/sponsor/interno34-logo.png"
                  alt="Interno 34"
                />
              </a>
            </div>
          </div>

          {/* INFO */}
          <div className="footer-col footer-info">
            <h4>Informazioni</h4>
            <p>
              <strong>FisioFitness</strong>
              <br />
              Dr. Costantino Picciallo
            </p>
            <p>P.IVA: 08494380721</p>
            <p>
              Email:{" "}
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
        </div>

        {/* FOOTER LEGAL */}
        <div className="footer-legal">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <span> | </span>
          <Link to="/cookie-policy">Cookie Policy</Link>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">
          © 2024 - {new Date().getFullYear()} FisioFitness – Tutti i diritti
          riservati
        </div>
      </div>
    </footer>
  );
}
