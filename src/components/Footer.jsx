import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebook,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

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
                href={import.meta.env.VITE_SOCIAL_YOUTUBE}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            </div>
          </div>

          {/* SPONSOR */}
          <div className="footer-col footer-sponsor">
            <h4>I Nostri Partner</h4>
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
            <p>Email: {import.meta.env.VITE_EMAIL}</p>
            <p>
              Via Palermo, 26
              <br />
              Gravina in Puglia (BA)
            </p>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} FisioFitness – Tutti i diritti riservati
        </div>
      </div>
    </footer>
  );
}
